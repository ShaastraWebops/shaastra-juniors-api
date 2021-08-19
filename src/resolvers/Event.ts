import { Event } from "../entities/Event";
import { Arg, Authorized, Ctx, Field, FieldResolver, Mutation, ObjectType, Query, Resolver, Root } from "type-graphql";
import { CreateEventInput, EditEventInput } from "../inputs/Event";
import { MyContext } from "../utils/context";
import moment from "moment";
import { EventType } from "../utils";
import { User } from "../entities/User";

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
    @Mutation(() => Boolean)
    async createEvent(@Arg("data") data: CreateEventInput, @Ctx() { user }: MyContext) {
        data.eventTimeFrom = moment(data.eventTimeFrom, "DD/MM/YYYY h:mm a").toISOString();
        data.eventTimeTo = moment(data.eventTimeTo, "DD/MM/YYYY h:mm a").toISOString();

        const event = await Event.create({ ...data, user }).save();
        return !!event;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async editEvent(@Arg("data") data: EditEventInput, @Arg("EventID") id: string ) {
        if(data.eventTimeFrom) data.eventTimeFrom = moment(data.eventTimeFrom, "DD/MM/YYYY h:mm a").toISOString();
        if(data.eventTimeTo) data.eventTimeTo = moment(data.eventTimeTo, "DD/MM/YYYY h:mm a").toISOString();

        const { affected } = await Event.update(id, { ...data });
        return affected === 1;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async deleteEvent(@Arg("EventID") id: string ) {
        const { affected } = await Event.delete(id);
        return affected === 1;
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

    @Authorized(["ADMIN"])
    @FieldResolver(() => User)
    async user(@Root() { user } : Event ) {
        const USER  = await User.findOneOrFail({ where: { id: user }});
        return USER;
    }
}