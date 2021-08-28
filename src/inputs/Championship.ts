import { Field, InputType } from "type-graphql";

@InputType("SetChampionshipInput")
export class SetChampionshipInput {
    @Field()
    schoolName: string;

    @Field()
    points: number;
}