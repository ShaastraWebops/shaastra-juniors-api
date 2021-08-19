import cuid from "cuid";
import bcrypt from "bcryptjs";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";
import { SendConfirmationMailOptions, SendVerificationMailOptions, Standard, UserRole } from "../utils";
import jwt from "jsonwebtoken";
import { mail } from "../utils/mail";
import { BaseEntity, BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Event } from "./Event"

registerEnumType( UserRole, { name: "UserRole" } );

@Entity("User")
@ObjectType("User")
export class User extends BaseEntity {

    @BeforeInsert()
    async setId() {
      this.id = cuid();
      this.verficationToken = cuid();
      this.password = await bcrypt.hash(this.password, 13);
    }

    static async sendVerificationMail({ name, email, id, verifyToken } : SendVerificationMailOptions) {
      const token = jwt.sign({id, verifyToken}, process.env.JWT_SECRET || "secret", { expiresIn: '1h'});
      const body = `Hello <b>${name}</b>,<br><br>
                    Thanks for signing up!<br><br>
                    Kindly verify your email address by clicking the ‘Verify email address’ button below 
                    to begin your journey as a Campus Ambassador at IITM’s annual tech-fest, Shaastra 2022.<br>
                    <a href="https://juniors.shaastra.org/verifyuser?token=${token}"><button>Verify</button></a><br><br>
                    Or verify using the link: https://juniors.shaastra.org/verifyuser?token=${token}<br><br>
                    Reach out to us in case of any queries at outreach@shaastra.org<br><br>
                    Welcome!<br>
                    Publicity team | Shaastra 2022<br><br>
                    The verification link expires within 1 hour.`;
      await mail({email, sub: "Verify your email address || Shaastra Juniors, Shaastra 2022, IIT Madras", body});
      console.log(token);
    }

    static async sendForgotResetMail({ name, email, id, verifyToken } : SendVerificationMailOptions) {
      const token = jwt.sign({id, verifyToken}, process.env.JWT_SECRET || "secret", { expiresIn: '0.5h'});
      const body = `Hello <b>${name}</b>,<br><br>
                    In case you forgot your password, you can reset it with a new password by 
                    clicking the ‘Reset my password’ button below.<br><br>
                    <a href="https://juniors.shaastra.org/forgotpassword?token=${token}"><button>Verify</button></a><br><br>
                    If you have not initiated this request, let us know at outreach@shaastra.org immediately.<br><br>
                    Reach out to us in case of any queries at outreach@shaastra.org<br><br>
                    Welcome!<br>
                    Publicity team | Shaastra 2022<br><br>
                    The verification link expires within 30 minutes`;
      await mail({email, sub: "Forgot your password || Shaastra Juniors, Shaastra 2022, IIT Madras", body});
      console.log(token);
    }

    static async sendConfirmationMail({ name, email } : SendConfirmationMailOptions) {
      const body = `Hello <b>${name}</b>,<br><br>
                    <b>Greetings from Shaastra 2021, IIT Madras!</b><br><br>
                    Thank you for signing up for the Shaastra Juniors.
                    Please complete the questionnaire on the portal by “<Given Date>”(you
                    can sign-in using this email ID and the password given during sign-up),
                    which is mandatory for selection. Further instructions pertaining to the
                    selection process shall be intimated by mail. Meanwhile, please like and
                    follow our Facebook page: fb.com/Shaastra for updates. If you have any
                    queries, drop a mail at studentrelations@shaastra.org<br><br><br>
                    Regards,<br>
                    Team Shaastra,<br>
                    IIT Madras`;
      await mail({ email, sub: "Sign Up Confirmation || Shaastra Juniors, Shaastra 2022, IIT Madras", body})
    }

    static fields = ["name", "email", "school", "class"]
  
    @PrimaryColumn()
    @Field(() => ID)
    id: string;

    @Column({ unique: true })
    @Field()
    sjID: string;
  
    @Column()
    @Field()
    name: string;
  
    @Column({ unique: true })
    @Field()
    email: string;

    @Column()
    password: string;

    @Column()
    @Field()
    school: string;

    @Column("enum", { enum: Standard })
    @Field(() => Standard)
    class: Standard;

    @Column({ default: false})
    @Field()
    isVerified: boolean;

    @Column("enum", { enum: UserRole, default: UserRole.USER })
    @Field(() => UserRole)
    role: UserRole;

    @Column({nullable: true})
    verficationToken: string;

    @Column({nullable: true})
    passUUID: string;

    //relations
    @OneToMany(() => Event, events => events.user)
    events: Event[]
}