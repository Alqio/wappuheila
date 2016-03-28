

create table associations (
	name VARCHAR NOT NULL UNIQUE
);

create table registrations (
	created timestamp default now() not null primary key,
	name text not null,
	email text not null unique,
	profilequote text,
	profilepic text,
	answer_id serial references answers(id),
	association text references associations(name)
);

insert into associations values ('AS'), ('Inkubio'), ('MK'), ('TiK'), ('FK'), ('SIK'), ('AK'), ('Athene'), ('KK'), ('KIK'), ('PJK'), ('IK'), ('Prodeko'), ('VK'), ('TF'), ('PT'), ('KY'), ('ARTS'), ('Muu/Other');
