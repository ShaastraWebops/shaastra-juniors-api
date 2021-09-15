import { Event } from "../entities/Event";
import { Arg, Authorized, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { CreateEventInput, EditEventInput } from "../inputs/Event";
import { MyContext } from "../utils/context";
import moment from "moment";
import { EventType, RegistraionType } from "../utils";
import { User } from "../entities/User";
import { EventFAQ } from "../entities/EventFAQ";
import { isRegisteredInEvent } from "../utils/isRegisteredInEvent";
import { Team } from "../entities/Team";
import { parse } from "json2csv";
import { getRepository, Raw } from "typeorm";

@ObjectType("GetEventsOutput")
class GetEventsOutput {
  @Field(() => [Event])
  events: Event[];
  
  @Field(() => Number)
  count: Number;
}

@Resolver(Event)
export class EventResolver {

    @Authorized(["ADMIN"])
    @Mutation(() => Event)
    async createEvent(@Arg("data") data: CreateEventInput, @Ctx() { user }: MyContext) {
        if(data.registrationType === RegistraionType.TEAM && data.teamSize === undefined) throw new Error("Enter Team Size");
        if((data.eventType !== EventType.SHOWS) && ((data.registrationOpenTime === undefined) || (data.registrationCloseTime === undefined))) throw new Error("Registration time is missing");

        const event = await Event.create({ ...data, user }).save();
        return event;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async editEvent(@Arg("data") data: EditEventInput, @Arg("EventID") id: string ) {

        const { affected } = await Event.update(id, { ...data });
        return affected === 1;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async deleteEvent(@Arg("EventID") id: string ) {
        const { affected } = await Event.delete(id);
        return affected === 1;
    }

    @Authorized(["ADMIN"])
    @Query(() => String)
    async exportCSV(@Arg("EventID") id: string) {
        const event = await Event.findOneOrFail(id);
        
        const eventRepository = getRepository(Event);
        //const teamRepository = getRepository(Team);
        let csv;
        if(event.registrationType === RegistraionType.INDIVIDUAL) {
            const registeredUsers = await eventRepository.createQueryBuilder("event")
            .where("event.id = :eventId", { eventId: id })
            .leftJoinAndSelect("event.registeredUsers", "user")
            .select(["user.name", "user.email", "user.sjID", "user.school", "user.class"])
            .execute();

            csv =  parse(registeredUsers);
        } else {
            // console.log("\n\n\n\n\n\n\n\n")
            // const registeredTeams = await Event.query(`SELECT "user"."sjID" AS "user_sjID", "user"."email" AS "user_email", "user"."school" AS "user_school", "user"."class" AS "user_class", "team"."name" AS "team_name", "user"."name" AS "user_name" FROM "Event" "event" LEFT JOIN "Team" "team" ON "team"."eventId"="event"."id"  LEFT JOIN "team_members_user" "team_user" ON "team_user"."teamId"="team"."id" LEFT JOIN "User" "user" ON "user"."id"="team_user"."userId" WHERE "event"."id" = '${id}'`)
            // const registeredTeams = await teamRepository.createQueryBuilder("team")
            // .select(["name"])
            // .leftJoinAndSelect("team.event", "event")
            // .where("event.id = :eventId", { eventId: id })
            // .leftJoinAndSelect("team.members", "user")
            // .select(["user.name", "user.email", "user.sjID", "user.school", "user.class"])
            // //.leftJoin("team.members", "user")
            // .execute();
            const registeredTeams = await Team.find({ where: { event }, relations: ["members"], select: ["name"] })//) as unknown) as CSVExportOutput[];

            let csvData = '"team name"';
            const csvHeading = ',"name","email","sjID","school","class"';
            for (let i = 0; i < event.teamSize; i++) {
                csvData += csvHeading;
            }

            registeredTeams.map((registeredTeam) => {

                csvData += `\n "${registeredTeam.name}"`;

                registeredTeam.members.map((member) => {
                    const { name, email, sjID, school } = member;
                    csvData += `, "${name}","${email}","${sjID}","${school}","${member.class}"`;
                })
            })
            csv = csvData;
        }

        return csv
    }

    @Query(() => GetEventsOutput)                                       //should remove past events
    async getEvents(
        @Arg("filter", { nullable: true }) eventType : EventType,
        @Arg("skip", { nullable: true }) skip: number,
        @Arg("limit", { nullable: true }) take: number
    ) {
        let filter = {}
        if(!!eventType) filter = { eventType }
        const events = await Event.find({ where: filter , skip, take, order: { eventTimeFrom: "ASC" } })
        const count = await Event.count({ where: filter });

        return { events, count }
    }

    @Query(() => Event)
    async getEvent(@Arg("EventID") id: string ) {
        const event = await Event.findOneOrFail({ where: { id }});
        return event;
    }

    @Query(() => [Event], { nullable: true })
    async todaysHighlights() {
        const dateNow = new Date();
        const date = moment(dateNow, "DD/MM/YYYY h:mm a").toISOString();
        console.log(date);

        let eventArray : Array<Event> = [];
        const showsEvents = await Event.find({ where: { eventType: EventType.SHOWS, eventTimeFrom: Raw((alias) => `${alias} >= :date`, { date }) }, take: 1, order: { eventTimeFrom: "ASC" } });
        const compEvents = await Event.find({ where: { eventType: EventType.COMPETITIONS, eventTimeFrom: Raw((alias) => `${alias} >= :date`, { date }) }, take: 1, order: { eventTimeFrom: "ASC" } });
        const workshopEvents = await Event.find({ where: { eventType: EventType.WORKSHOPS, eventTimeFrom: Raw((alias) => `${alias} >= :date`, { date }) }, take: 1, order: { eventTimeFrom: "ASC" } });

        if(showsEvents.length !== 0) eventArray.push(showsEvents[0]);
        if(compEvents.length !== 0) eventArray.push(compEvents[0]);
        if(workshopEvents.length !== 0) eventArray.push(workshopEvents[0]);

        return eventArray;
    }

    @Authorized()
    @Mutation(() => Boolean)
    async register(@Arg("EventID") id: string, @Ctx() { user }: MyContext ) {
        const event = await Event.findOneOrFail( id, { relations: ["registeredUsers"]});

        const startDate = new Date(event.registrationOpenTime);
        const currentDate = new Date();
        const endDate = new Date(event.registrationCloseTime);
        if(currentDate.getTime() <= startDate.getTime()) throw new Error("Registration is not opened yet");
        if(currentDate.getTime() >= endDate.getTime()) throw new Error("Registration Closed");
        if(!user) throw new Error("Login to Register")
        if(event.registrationType === RegistraionType.NONE) throw new Error("Registration for this event is not required")
        if(event.registrationType === RegistraionType.TEAM) throw new Error("Not allowed for individual registration")

        const userF = event.registeredUsers.filter((useR) => useR.id === user.id);
        if( userF.length === 1 ) throw new Error("User registered already");

        if( event.audience.includes(user.class) ) {
            event.registeredUsers.push(user);
            event.save();
        } else throw new Error("Registration is not open for your class")

        return !!event;
    }

    @Authorized(["ADMIN"])
    @FieldResolver(() => User)
    async user(@Root() { user } : Event ) {
        const USER  = await User.findOneOrFail({ where: { id: user }});
        return USER;
    }

    @Authorized(["ADMIN"])
    @FieldResolver(() => [User])
    async registeredUser(@Root() { id }: Event) {
        const event = await Event.findOneOrFail(id, { relations: ["registeredUsers"] });
      
        return event.registeredUsers;
    }

    @Authorized(["ADMIN"])
    @FieldResolver(() => Number)
    async registeredUserCount(@Root() { id }: Event) {
        const event = await Event.findOneOrFail(id, { relations: ["registeredUsers"] });
      
        return event.registeredUsers.length;
    }

    @Authorized(["ADMIN"])
    @FieldResolver(() => [Team])
    async registeredTeam(@Root() { id }: Event) {
        const teams = await Team.find({ where: { event: id }, relations: ["members"] });
        return teams;
    }

    @Authorized(["ADMIN"])
    @FieldResolver(() => Number)
    async registeredTeamCount(@Root() { id }: Event) {
        const count = await Team.count({ where: { event: id } });
        return count;
    }

    @Authorized()
    @FieldResolver(() => Boolean )
    async isRegistered(@Root() { id }: Event, @Ctx() { user }: MyContext ) {
        const res = await isRegisteredInEvent(id, user.id);
        return res;
    }

    @Authorized()
    @FieldResolver(() => Team, { nullable: true })
    async yourTeam(@Root() { id }: Event, @Ctx() { user }: MyContext) {
        const event = await Event.findOneOrFail(id, { relations: ["registeredTeam"] });

        let getTeamID;
        await Promise.all(event.registeredTeam?.map(async (team) => {
            const teaM = await Team.findOneOrFail(team.id, { relations: ["members"], select: ["id", "name"] });
    
            const userF = teaM.members.filter((member) => member.id === user.id);
            if(userF.length === 1) getTeamID = team.id;
        }));
        return await Team.findOneOrFail(getTeamID, { relations: ["members"] });
    }

    @FieldResolver(() => [EventFAQ])
    async faqs(@Root() { id }: Event ) {
        const eventFAQs = await EventFAQ.find({ where: { event: id }, order: { updatedOn: "DESC" } });
        return eventFAQs;
    }
}