import { User } from "../entities/User";
import { CreateUserInput, EditProfileInput, GetUsersFilter, LoginInput, RequestForgotPassInput, ResetPasswordInput } from "../inputs/User";
import { Arg, Authorized, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { MyContext } from "../utils/context";
import { ADMINMAILLIST, UserRole } from "../utils";
import cuid from "cuid";
import { Like } from "typeorm";
import { Event } from "../entities/Event";
import { Team } from "../entities/Team";
import { parse } from "json2csv";

@ObjectType("GetUsersOutput")
class GetUsersOutput {
  @Field(() => [User])
  users: User[];
  
  @Field(() => Number)
  count: Number;
}

@Resolver(User)
export class UserResolver {

    @Mutation(() => Boolean)
    async createUser(@Arg("data") data: CreateUserInput) {
        const count = await User.count();
        var caidNum = ( "0000" + (count + 1) ).slice(-4);
        const sjID = `S22SJ${caidNum}`;
        const user  = await User.create({ ...data, sjID }).save();

        const { name, email, id, verficationToken: verifyToken } = user;
        await User.sendVerificationMail({ name, email, id, verifyToken });

        if(ADMINMAILLIST.includes(email)){
            const { affected } = await User.update(user?.id, { role: UserRole.ADMIN })
            return affected === 1;
        }

        return true;
    }

    @Mutation(() => Boolean)
    async resendVerificationMail(@Arg("data") { email }: RequestForgotPassInput) {
        const user = await User.findOneOrFail({ where: { email } });
        const { name, id, verficationToken: verifyToken, isVerified } = user;

        if(isVerified) throw new Error("Email has been verified before");

        await User.sendVerificationMail({ name, email, id, verifyToken });

        return true;
    }

    @Mutation(() => Boolean)
    async verifyUser(@Arg("token") token: string ) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET ||  "secret" ) as any;
        const user = await User.findOneOrFail({ where: {id: decoded.id} });
        
        if( user.isVerified === true ) return true;

        if(user.verficationToken === decoded.verifyToken) {
            const { affected } = await User.update(user.id, {isVerified: true});
            if(affected === 1) {
                await User.sendConfirmationMail({ name: user.name, email: user.email });
                return true;
            }
        }
        return false;
    }

    @Mutation(() => User, { nullable: true })
    async login(@Arg("data") { email, password }: LoginInput, @Ctx() {res, user} : MyContext) {
        const userLogged = await User.findOneOrFail({ where: { email} });
        if(!userLogged) throw new Error("Account Not Found");

        if(!userLogged.isVerified) throw new Error("Oops, email not verified!");

        const checkPass = await bcrypt.compare(password, userLogged?.password);
        if(!checkPass) throw new Error("Invalid Credential");

        let token = jwt.sign({ id: userLogged.id }, process.env.JWT_SECRET || "secret");

        res.cookie("token", token )
        user = userLogged
        console.log(user)
        return userLogged;
    }

   
    @Query(() => User, {nullable: true})
    async me(@Ctx() { user } : MyContext) {
        console.log( User.findOneOrFail({where: {id: user.id}}))
        return User.findOneOrFail({where: {id: user.id}});
    }

    @Authorized()
    @Mutation(() => Boolean, {nullable: true})
    async editProfile(@Ctx() { user } : MyContext, @Arg("data") data: EditProfileInput) {
        const { affected } = await User.update(user.id, { ... data})
        return affected === 1;
    }

    @Mutation(() => Boolean)
    async reqForgotPassVerification(@Arg("data") { email }: RequestForgotPassInput) {
        const user = await User.findOneOrFail({ where: { email } });

        const passUUID = cuid();
        await User.update(user.id, { passUUID });

        const { name, id } = user;
        await User.sendForgotResetMail({ name, email, id, verifyToken: passUUID});
        return true;
    }

    @Mutation(() => Boolean)
    async resetPassword(@Arg("data") { token, newPassword }: ResetPasswordInput ) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET ||  "secret" ) as any;
        const user = await User.findOneOrFail({ where: { id: decoded.id } });

        if(user.passUUID === decoded.verifyToken) {
            const password = await bcrypt.hash(newPassword, 13);
            const { affected } = await User.update(user.id, { password });
            return affected === 1
        }
        return false;
    }

    @Mutation(() => Boolean)
    async logoutUser(@Ctx() { res } : MyContext ) {
        res.cookie("token", "", { httpOnly: true, maxAge: 1 })

        return true;
    }

    @Authorized(["ADMIN"])
    @Query(() => GetUsersOutput, { nullable: true })
    async getUsers(
        @Arg("filter", { nullable: true }) filter : GetUsersFilter,
        @Arg("skip", { nullable: true }) skip: number,
        @Arg("limit", { nullable: true }) take: number) {

        const users = await User.find({ where: {...filter}, skip, take, order: { name: "ASC"} });

        const count = await User.count({ where: filter });
        return { users, count };
    }

    @Authorized(["ADMIN"])
    @Query(() => Number)
    async getUsersCount() {
        return await User.count({ where: { role: UserRole.USER }});
    }

    @Authorized(["ADMIN"])
    @Query(() => String)
    async getUsersDataCSV() {
        const users = await User.find({ where: { role: UserRole.USER }, select: ["name", "email", "sjID", "class", "school", "state", "city"] });

        return parse(users);
    }

   
    @Query(() => User, { nullable: true })
    async getUser(@Arg("userId") userId: string) {
      return await User.findOneOrFail(userId);
    }

    @Authorized(["ADMIN"])
    @Query(() => [User], { nullable: true })
    async searchUser( @Arg("search") search: string ) {
        let users: User[] = [];
        await Promise.all(User.fields.map(async (field) => {    //user fields = [ sjid, name, email, school, class ]
            const filter ={ [field]:  Like(`%${search}%`) };
            const userF = await User.find({ where: filter });
            userF.forEach( (user) => { users.push(user) })
          }));

        const userStr = users.map( (obj) => JSON.stringify(obj) );
        const uniqueUserStr = new Set(userStr);
        return Array.from(uniqueUserStr).map( (str) => JSON.parse(str) );
    }

    @Authorized(["ADMIN"])
    @FieldResolver(() => [Event])
    async events(@Root() { id }: User ) {
        const events = await Event.find({ where: { user: id } });
        return events;
    }

    @Authorized()
    @FieldResolver(() => [Event])
    async registeredEvents(@Root() { id }: User ) {
        let { registeredEvents, teams } = await User.findOneOrFail( id, { relations: ["registeredEvents", "teams"] } );

        await Promise.all(teams?.map(async (team) => {
            const teaM = await Team.findOneOrFail(team.id, { relations: ["event"] });
            registeredEvents.push(teaM.event);
        }));

        return registeredEvents;
    }
}