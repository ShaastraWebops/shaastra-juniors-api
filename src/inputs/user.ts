import { Field, InputType, registerEnumType } from "type-graphql";
import { IsEmail/*, Length*/ } from "class-validator";
import { Standard, UserRole } from "../utils";

registerEnumType( Standard, { name: "Standard" } );

@InputType("CreateUserInput")
export class CreateUserInput {
	@Field()
	name: string;

	@Field()
	@IsEmail()
	email: string;

	@Field()
	password: string;

	// @Field()
	// @Length(10, 10)
	// mobile: string;

	@Field()
	school: string;

	@Field(() => Standard)
	class: Standard;
}

@InputType("LoginInput")
export class LoginInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	password: string;
}

@InputType("EditProfileInput")
export class EditProfileInput {
	@Field({ nullable: true })
	name?: string;

	@Field({ nullable: true })
	password?: string;

	// @Field({ nullable: true })
	// @Length(10, 10)
	// mobile?: string;

	@Field({ nullable: true })
	school?: string;

	@Field({ nullable: true })
	city?: string;
}

@InputType("RequestForgotPassInput")
export class RequestForgotPassInput {
	@Field()
	@IsEmail()
	email: string;
}

@InputType("ResetPasswordInput")
export class ResetPasswordInput {
	@Field()
	token: string;

	@Field()
	newPassword: string;
}

@InputType("GetUsersFilter")
export class GetUsersFilter {
	@Field({ nullable: true })
	city: string;

	@Field({ nullable: true })
	school: string;

	@Field({ nullable: true })
	class: Standard;

	@Field({ nullable: true })
	role: UserRole;
}