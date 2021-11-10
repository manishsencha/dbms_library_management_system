const express = require("express")
const pool = require("./db")
const app = express()
const PORT = 3001 || process.env.PORT
app.use(express.urlencoded({ extended: false }))
app.set("view engine", "ejs")

app.get("/", (req, res) => {
  return res.render("home")
})

app.get("/login", (req, res) => {
  return res.render("login")
})

app.get("/addstudent", async (req, res) => {
  try {
    let departments = []
    await pool
      .query("select department_name from department")
      .then((results) => {
        departments = results.rows
      })
      .catch((err) => console.log(err))
    return res.render("add_student", { departments: departments })
  } catch (e) {
    console.log(e)
  }
})

app.get("/addbook", (req, res) => {
  return res.render("add_book")
})

app.get("/adddepartment", (req, res) => {
  return res.render("add_department")
})
app.get("/issue", (req, res) => {
  return res.render("issue")
})
app.post("/userlogin", (req, res) => {
  const { username, password } = req.body
  console.log(req.body)

  return res.redirect("/login")
})

app.post("/registerdepartment", async (req, res) => {
  const { deptname } = req.body
  console.log(deptname)
  await pool
    .query("insert into department (department_name) values ($1)", [deptname])
    .then(() => console.log("Success"))
    .catch((e) => console.log("ERROR", e))
  return res.redirect("/adddepartment")
})

app.post("/insertissue", async (req, res) => {
  const { bookid, enrolmentnumber } = req.body
  let issued_books = 0,
    returned_books = 0
  await pool
    .query("select count(*) from issuedbooks where enrolment_number = $1", [
      enrolmentnumber,
    ])
    .then((res) => {
      issued_books = res.rows[0].count
    })
    .catch((e) => console.error(e))
  await pool
    .query(
      "select count(*) from returnedbooks where issue_id in (select issue_id from issuedbooks where enrolment_number = $1)",
      [enrolmentnumber]
    )
    .then((res) => {
      returned_books = res.rows[0].count
    })
    .catch((e) => console.log(e))
  if (issued_books - returned_books >= 3) {
    return res.redirect("/issue")
  }
  await pool
    .query(
      "insert into issuedbooks (enrolment_number, book_id) values ($1, $2)",
      [enrolmentnumber, bookid]
    )
    .then(() => console.log("success"))
    .catch((e) => console.error(e))
  return res.redirect("/issue")
})

app.get("/return/:id", async (req, res) => {
  const enrolment_number = req.params.id
  console.log(enrolment_number)
  let data = []
  await pool
    .query(
      "select * from issuedbooks where enrolment_number=$1 and issue_id not in (select issue_id from returnedbooks)",
      [enrolment_number]
    )
    .then((results) => (data = results.rows))
    .catch((e) => console.log(e))
  console.log(data)
  return res.render("return", { data: data })
})

app.get("/return", async (req, res) => {
  return res.render("find_student")
})

app.post("/redirect_student", async (req, res) => {
  const { enrolmentnumber } = req.body
  let a = []
  await pool
    .query(
      "select enrolment_number from students where enrolment_number = $1",
      [enrolmentnumber]
    )
    .then((results) => {
      a = results.rows
      if (a.length > 0) {
        return res.redirect(`/return/${enrolmentnumber}`)
      } else {
        return res.redirect("/return")
      }
    })
    .catch((e) => {
      console.log(e)
      return res.redirect("/return")
    })
})

app.post("/insertreturn", async (req, res) => {
  const { issueid } = req.body
  let fine = 0, enrolment_number=""
  console.log(issueid)
  await pool
    .query("select * from issuedbooks where issue_id = $1", [issueid])
    .then((results) => {
      enrolment_number = results.rows[0].enrolment_number
      let temp_fine =
        ((new Date() - new Date(results.rows[0].return_date)) /
          (1000 * 60 * 60 * 24)) *
        10
      fine = Math.max(temp_fine, fine)
    })
    .catch((e) => console.log(e))
  await pool
    .query("insert into returnedbooks (fine, issue_id) values ($1, $2)", [
      fine,
      issueid,
    ])
    .then(() => {
      return res.redirect(`/return/${enrolment_number}`)
    })
})

app.post("/registerstudent", (req, res) => {
  const {
    enrolmentnumber,
    name,
    departmentname,
    email,
    address,
    contact,
    registrationdate,
    expirydate,
  } = req.body
  console.log(req.body)
  pool
    .query(
      "insert into students (enrolment_number, student_name,department_id, student_address, student_mail, student_contact, registration_date, expiry_date) values ($1, $2, (select department_id from department where department_name = $3), $4, $5, $6, $7, $8)",
      [
        enrolmentnumber,
        name,
        departmentname,
        address,
        email,
        contact,
        registrationdate,
        expirydate,
      ]
    )
    .then(() => console.log("SUCCESS"))
    .catch((e) => console.log(e))
  return res.redirect("/addstudent")
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})

// select department_number from department where department_name = given_name
