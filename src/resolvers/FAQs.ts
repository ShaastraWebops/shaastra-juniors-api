import { FAQs } from "../entities/FAQs";
import { UserRole } from "../utils";
import { MyContext } from "../utils/context";
import { Arg, Authorized, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { IsNull, Not } from "typeorm";

@ObjectType("GetFAQsOutput")
class GetFAQsOutput {
  @Field(() => [FAQs])
  faqs: FAQs[];
  
  @Field(() => Number)
  count: Number;
}

@Resolver(FAQs)
export class FAQsResolver {

    @Mutation(() => Boolean)
    async createFAQ(@Arg("question") question: string) {
        const faq = await FAQs.create({ question }).save();

        return !!faq;
    }

    @Query(() => GetFAQsOutput)
    async getFAQs(
        @Arg("isAnswered", { nullable: true }) isAnswered: boolean,
        @Arg("skip", { nullable: true }) skip: number,
        @Arg("limit", { nullable: true }) take: number,
        @Ctx() { user }: MyContext
    ) {
        let filter = { answer: isAnswered ? Not(IsNull()) : IsNull() } ;
        if(user?.role !== UserRole.ADMIN) filter = { answer: Not(IsNull()) }

        const faqs = await FAQs.find({ where: filter, take, skip, order: { createdOn: "DESC" } });
        const count = await FAQs.count({ where: filter });
        return { faqs, count };
    }

    @Query(() => FAQs)
    async getFAQ(@Arg("FAQID") faqid: string) {
        const faq = await FAQs.findOneOrFail(faqid);
        return faq;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async answerFAQ(@Arg("FAQID") faqid: string, @Arg("answer") answer: string ) {
        const { affected } = await FAQs.update(faqid, {answer});
        return affected === 1;
    }

    @Authorized(["ADMIN"])
    @Mutation(() => Boolean)
    async deleteFAQs(@Arg("FAQID") faqid: string) {
        const { affected } = await FAQs.delete(faqid);
        return affected === 1;
    }
}