import cuid from "cuid";
import bcrypt from "bcryptjs";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { SendConfirmationMailOptions, SendVerificationMailOptions, Standard, UserRole } from "../utils";
import jwt from "jsonwebtoken";
import { mail } from "../utils/mail";
import { BaseEntity, BeforeInsert, Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { Event } from "./Event"
import { Team } from "./Team";

registerEnumType( UserRole, { name: "UserRole" } );

@Entity("User")
@ObjectType("User")
export class User extends BaseEntity {

    @BeforeInsert()
    async setId() {
      this.id = cuid();
      this.verficationToken = cuid();
      this.password = await bcrypt.hash(this.password, 13);
    }

    static async sendVerificationMail({ name, email, id, verifyToken } : SendVerificationMailOptions) {
      const token = jwt.sign({id, verifyToken}, process.env.JWT_SECRET || "secret", { expiresIn: '1h'});
      const body = `Hello <b>${name}</b>,<br><br>
                    Thanks for signing up!<br><br>
                    Kindly verify your email address by clicking the ‘Verify email address’ button below 
                    to begin your journey of exploration through the set of brain-smacking events that we've
                    got for you as a part of Shaastra Juniors 2021!<br><br>
                    <a style='width: 100%; text-align: center;' href="https://juniors.shaastra.org/verifyuser/${token}"><button>Verify</button></a><br><br>
                    Or verify using the link: https://juniors.shaastra.org/verifyuser/${token}<br><br>
                    The verification link expires within 1 hour.<br><br>
                    Reach out to us in case of any queries at juniors@shaastra.org<br><br>
                    Best regards! <br>
                    The Shaastra Team | IIT Madras<br><br>`;
      await mail({name, email, sub: "Verify your email address || Shaastra Juniors, Shaastra 2022, IIT Madras", body});
      console.log(token);
    }

    static async sendForgotResetMail({ name, email, id, verifyToken } : SendVerificationMailOptions) {
      const token = jwt.sign({id, verifyToken}, process.env.JWT_SECRET || "secret", { expiresIn: '0.5h'});
      const body = `Hello <b>${name}</b>,<br><br>
                    In case you forgot your password, you can reset it with a new password by 
                    clicking the ‘Reset my password’ button below.<br><br>
                    <a href="https://juniors.shaastra.org/forgotpassword/${token}"><button>Verify</button></a><br><br>
                    The verification link expires within 30 minutes<br><br>
                    If you have not initiated this request, let us know at juniors@shaastra.org immediately.<br><br>
                    Reach out to us in case of any queries at juniors@shaastra.org<br><br>
                    Best regards! <br>
                    The Shaastra Team | IIT Madras<br><br>`;
      await mail({name, email, sub: "Forgot your password || Shaastra Juniors, Shaastra 2022, IIT Madras", body});
      console.log(token);
    }

    static async sendConfirmationMail({ name, email } : SendConfirmationMailOptions) {
      const body = `Hello <b>${name}</b>,<br><br>
                    <b>Greeting from team Shaastra, IIT Madras ! </b><br><br>
                    We are delighted to have you onboard with us for Shaastra Juniors. 
                    We hope you enjoy the spectrum of competitions, workshops, shows 
                    and lectures that we've arranged as a part of Shaastra Juniors 2021.<br><br><br>
                    Please feel free to reach out to us by mailing to juniors@shaastra.org<br><br><br>
                    Visit juniors.shaastra.org for more information.<br><br><br>`;
      await mail({ name, email, sub: "Sign Up Confirmation || Shaastra Juniors, Shaastra 2022, IIT Madras", body})
    }

    static fields = ["name", "email", "school", "class"]
  
    @PrimaryColumn()
    @Field(() => ID)
    id: string;

    @Column({ unique: true })
    @Field()
    sjID: string;
  
    @Column()
    @Field()
    name: string;
  
    @Column({ unique: true })
    @Field()
    email: string;

    @Column()
    password: string;

    @Column()
    @Field()
    school: string;

    @Column("enum", { enum: Standard })
    @Field(() => Standard)
    class: Standard;

    @Column()
    @Field()
    state: string;
  
    @Column()
    @Field()
    city: string;
    
    @Column({ default: false})
    @Field()
    isVerified: boolean;

    @Column("enum", { enum: UserRole, default: UserRole.USER })
    @Field(() => UserRole)
    role: UserRole;

    @Column({nullable: true})
    verficationToken: string;

    @Column({nullable: true})
    passUUID: string;

    //relations
    @OneToMany(() => Event, events => events.user)
    events: Event[];

    @ManyToMany(() => Event, (event) => event.registeredUsers)
    registeredEvents: Event[];

    @ManyToMany(() => Team, (team) => team.members)
    teams: Team[]
}