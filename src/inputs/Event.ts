import { EventType, RegistraionType, Standard } from "../utils";
import { Field, InputType, ObjectType } from "type-graphql";

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

    @Field(() => RegistraionType)
    registrationType: RegistraionType;

    @Field({ nullable: true })
    teamSize: number;
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

    @Field(() => RegistraionType, { nullable: true })
    registrationType: RegistraionType;

    @Field({ nullable: true })
    teamSize: number;
}

@ObjectType()
export class CSVExportOutput {
    @Field()
    name: string;

    @Field(() => [CSVExportUserOutput])
    members: CSVExportUserOutput[]
}

@ObjectType()
export class CSVExportUserOutput {
    @Field()
    name: string;

    @Field()
    email: string;

    @Field()
    sjID: string;

    @Field()
    school: string;

    @Field(() => Standard)
    class: Standard;
}