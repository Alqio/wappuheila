
CREATE TABLE answers (
    id serial NOT NULL PRIMARY KEY,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    wappufiilis integer NOT NULL,
    wappufiilis_toinen text NOT NULL,
    first_thing text NOT NULL,
    wappu_lasts integer NOT NULL,
    spontaani integer NOT NULL,
    wappuheila_before text NOT NULL,
    wappuheila_dream text NOT NULL,
    lempinumero integer NOT NULL,
    kossu_or_jallu text NOT NULL,
    wappu_or_juhannus text NOT NULL,
    kissa_or_koira text NOT NULL,
    kinkku_or_juusto text NOT NULL,
    kukka_hattu_tati text NOT NULL,
    metsa_kaupunki text NOT NULL,
    paalla_alla text NOT NULL,
    kalia text NOT NULL,
    kaljatolkki text NOT NULL,
    hesa_stadi text NOT NULL,
    reilaamaan_rantalomalle text NOT NULL,
		tinder_kinder text NOT NULL,
    ufot text NOT NULL,
    yhdyssanat text NOT NULL,
    design_vai_bisnes text NOT NULL,
    got text NOT NULL,
    lehtimyyja text NOT NULL,
    gt text NOT NULL,
    viimeksi text NOT NULL,
    toteemi text NOT NULL
);

create table associations (
	name VARCHAR NOT NULL PRIMARY KEY
);

CREATE TABLE registrations (
    created timestamp without time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    email text NOT NULL PRIMARY KEY,
		allergies text NOT NULL,
    answer_id integer NOT NULL references answers(id),
    association text REFERENCES associations(name),
    profilequote text,
    profilepic text
);

create table matches (
    id serial NOT NULL PRIMARY KEY, 
    answer_id integer references answers(id) NOT NULL, 
    match text references registrations(email) NOT NULL
);

insert into associations values ('AS'), ('Inkubio'), ('MK'), ('TiK'), ('FK'), ('SIK'), ('AK'), ('Athene'), ('KK'), ('KIK'), ('PJK'), ('IK'), ('Prodeko'), ('VK'), ('TF'), ('PT'), ('KY'), ('ARTS'), ('Muu/Other');

/* test data */

/*COPY answers (id, created_at, wappufiilis, first_thing, wappu_lasts, spontaani, wappuheila_before, wappuheila_dream, lempinumero, kossu_or_jallu, wappu_or_juhannus, kissa_or_koira, pizza_or_hamburger, kokis_pepsi, metsa_kaupunki, paalla_alla, kalia, kaljatolkki, hesa_stadi, reilaamaan_rantalomalle, ufot, yhdyssanat, muistio, salkkarit, amnesia, blind, lehtimyyja, gt, viimeksi, toteemi, tinder_kinder) FROM stdin;
1	2016-03-18 01:39:43.434782	7	asd	13	8	1	2	6	0	0	1	1	0	0	0	1	1	1	1	0	1	1	0	0	0	1	2	0	asdidas	1
2	2016-03-18 01:40:25.024147	7	asd	13	8	1	2	6	0	0	1	1	0	0	0	1	1	1	1	0	1	1	0	0	0	1	2	0	asdidas	0
\.

insert into registrations (name, email, allergies, answer_id, association, profilequote, profilepic) values ('ultsi', 'joonas.ulmanen@gmail.com', '-', 1, 'TiK', 'Olen spontaanin tyhmä', 'https://scontent-waw1-1.xx.fbcdn.net/hphotos-xal1/v/t1.0-9/12919757_10206144043700695_7276859788433740001_n.jpg?oh=f669e0ea204a41d419bca4a819a89b3a&oe=5788DC00');
	
insert into registrations (name, email, allergies, answer_id, association, profilequote, profilepic) values ('Lol', 'lolmanen@gmail.com', '-', 2, 'AS', 'Toinen', 'https://scontent-waw1-1.xx.fbcdn.net/hphotos-xal1/v/t1.0-9/12919757_10206144043700695_7276859788433740001_n.jpg?oh=f669e0ea204a41d419bca4a819a89b3a&oe=5788DC00' );*/
