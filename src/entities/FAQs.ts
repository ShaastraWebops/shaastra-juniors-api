import cuid from "cuid";
import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("FAQs")
@ObjectType("FAQs")
export class FAQs extends BaseEntity {

    @BeforeInsert()
    setId() {
      this.id = cuid();
    }
  
    @PrimaryColumn()
    @Field(() => ID)
    id: string;
      
    @Column()
    @Field()
    question: string;
  
    @CreateDateColumn()
    @Field()
    createdOn: string;

    @Column({ nullable: true })
    @Field({ nullable: true })
    answer: string;

    @UpdateDateColumn()
    @Field()
    updatedOn: string;

}