import { Championship } from "../entities/Championship";
import { Arg, Authorized, Mutation, Query, Resolver } from "type-graphql";
import { SetChampionshipInput } from "../inputs/Championship";

@Resolver(Championship)
export class ChampionshipResolver {
    @Query(() => [Championship])
    async championship() {
        return await Championship.find({ order: { points: "DESC" } });
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async setChampionship(@Arg("data") data : SetChampionshipInput) {
        const champ = await Championship.create({ ...data }).save();
        return !!champ;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async clearChampionship() {
        return await Championship.clear()
        .then(() => {
            return true;
        })
        .catch(() => {
            return false
        });
    }
}