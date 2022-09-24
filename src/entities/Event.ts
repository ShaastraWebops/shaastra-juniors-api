import cuid from "cuid";
import { EventType, RegistraionType, Standard } from "../utils";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { BaseEntity, BeforeInsert, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { EventFAQ } from "./EventFAQ";
import { Team } from "./Team";

registerEnumType( Standard, { name: "Standard" } );
registerEnumType( EventType, { name: "EventType" } );
registerEnumType( RegistraionType, { name: "RegistraionType" } );

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
    @Field({ nullable: true })
    requirements: string;

    @Column()
    @Field({ nullable: true })
    platform: string;

    @Column()
    @Field()
    pic: string;

    @Column("enum", { enum: EventType })
    @Field(() => EventType)
    eventType: EventType;

    @Column({ name: 'audience', type: 'enum', enum: Standard, array: true, nullable: true })
    @Field(() => [Standard], {nullable: true})
    audience: Standard[]

    @Column("timestamptz", { nullable: true })
    @Field({ nullable: true })
    registrationOpenTime: string;

    @Column("timestamptz", { nullable: true })
    @Field({ nullable: true })
    registrationCloseTime: string;

    @Column("timestamptz")
    @Field()
    eventTimeFrom: string;

    @Column("timestamptz")
    @Field()
    eventTimeTo: string;

    @UpdateDateColumn()
    @Field()
    updatedOn: string;

    @Column()
    @Field()
    registrationType: RegistraionType;

    @Column({ default: 1 })
    @Field()
    teamSize: number;

    //relations
    @ManyToOne(() => User, user => user.events)
    user: User;

    @OneToMany(() => EventFAQ, faqs => faqs.event)
    faqs: EventFAQ[];

    @ManyToMany(() => User, (user) => user.registeredEvents)
    @JoinTable()
    registeredUsers: User[];

    @OneToMany(() => Team, (team) => team.event)
    registeredTeam: Team[];
}