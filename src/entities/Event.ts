import cuid from "cuid";
import { EventType, Standard } from "../utils";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { EventFAQ } from "./EventFAQ";

registerEnumType( Standard, { name: "Standard" } );
registerEnumType( EventType, { name: "EventType" } );

@Entity("Event")
@ObjectType("Event")
export class Event extends BaseEntity {

    @BeforeInsert()
    setId() {
      this.id = cuid();
    }
      
    @PrimaryColumn()
    @Field(() => ID)
    id: string;

    @Column()
    @Field()
    title: string;
      
    @Column()
    @Field()
    description: string;

    @Column()
    @Field()
    pic: string;

    @Column("enum", { enum: EventType })
    @Field(() => EventType)
    eventType: EventType;

    @Column({ name: 'audience', type: 'enum', enum: Standard, array: true })
    @Field(() => [Standard])
    audience: Standard[]

    @Column("timestamptz")
    @Field()
    eventTimeFrom: string;

    @Column("timestamptz")
    @Field()
    eventTimeTo: string;

    @UpdateDateColumn()
    @Field()
    updatedOn: string;

    //relations
    @ManyToOne(() => User, user => user.events)
    user: User;

    @OneToMany(() => EventFAQ, faqs => faqs.event)
    faqs: EventFAQ[]
}