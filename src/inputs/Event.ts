import { EventType, Standard } from "../utils";
import { Field, InputType } from "type-graphql";

@InputType("CreateEventInput")
export class CreateEventInput {

    @Field()
    title: string;

    @Field()
    description: string;

    @Field()
    pic: string;

    @Field(() => EventType)
    eventType: EventType;

    @Field(() => [Standard])
    audience: Standard[]

    @Field()
    eventTimeFrom: string;

    @Field()
    eventTimeTo: string;
}

@InputType("EditEventInput")
export class EditEventInput {

    @Field({ nullable: true })
    title: string;

    @Field({ nullable: true })
    description: string;

    @Field({ nullable: true })
    pic: string;

    @Field(() => EventType, { nullable: true })
    eventType: EventType;

    @Field(() => [Standard], { nullable: true })
    audience: Standard[]

    @Field({ nullable: true })
    eventTimeFrom: string;

    @Field({ nullable: true })
    eventTimeTo: string;
}