

create table guilds (
	name VARCHAR NOT NULL UNIQUE
);

insert into guilds values ('AS'), ('Inkubio'), ('MK'), ('TiK'), ('FK'), ('SIK'), ('AK'), ('Athene'), ('KK'), ('KIK'), ('PJK'), ('IK'), ('Prodeko'), ('VK'), ('TF'), ('PT');

create table registrations (
	created timestamp default now() not null primary key,
	firstname text not null,
	lastname text not null,
	email text not null,
	phone text,
	dobday numeric not null check(dobday > 0),
	dobmonth numeric not null check(dobmonth > 0),
	dobyear numeric not null check(dobyear > 0),
	guild text references guilds(name)
);
