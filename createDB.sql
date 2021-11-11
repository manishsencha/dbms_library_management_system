create table department(
	department_id serial primary key, 
	department_name varchar unique not null
);

create table books(
	book_id serial primary key,
	book_name varchar not null,
	isbn varchar unique not null,
	author varchar not null,
	publisher varchar not null,
	number_of_copies integer not null, check (number_of_copies > 0)
);

create table students(
	enrolment_number varchar primary key,
	student_name varchar not null,
	student_address varchar not null,
	student_mail varchar unique not null,
	student_contact varchar not null,
	department_id integer not null,
	registration_date date not null,
	expiry_date date not null,  check (registration_date < expiry_date),
	foreign key (department_id) references department(department_id)
);

create table issuedbooks(
	issue_id serial primary key,
	enrolment_number varchar not null,
	book_id integer not null,
	issue_date date default current_date, 
	return_date date default current_date + interval '7 days',
	foreign key (book_id) references books(book_id),
	foreign key (enrolment_number) references students(enrolment_number)
);

create table returnedbooks (
	return_id serial primary key,
	issue_id integer not null, 
	return_date date not null,
	fine integer default 0,
	foreign key (issue_id ) references issuedbooks(issue_id)
);