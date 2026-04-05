// ===============================
// MongoDB Zen Class Program DB
// ===============================

// ---------- USERS ----------
db.users.insertMany([
  { user_id: 1, name: "Arpit", mentor_id: 101 },
  { user_id: 2, name: "Rahul", mentor_id: 102 },
  { user_id: 3, name: "Sneha", mentor_id: 101 }
]);

// ---------- MENTORS ----------
db.mentors.insertMany([
  { mentor_id: 101, name: "Mentor A" },
  { mentor_id: 102, name: "Mentor B" }
]);

// ---------- TOPICS ----------
db.topics.insertMany([
  { topic: "HTML", date: new Date("2020-10-10") },
  { topic: "CSS", date: new Date("2020-10-20") },
  { topic: "JS", date: new Date("2020-11-05") }
]);

// ---------- TASKS ----------
db.tasks.insertMany([
  { task: "Task 1", date: new Date("2020-10-15"), submitted_users: [1] },
  { task: "Task 2", date: new Date("2020-10-25"), submitted_users: [2] },
  { task: "Task 3", date: new Date("2020-11-01"), submitted_users: [] }
]);

// ---------- COMPANY DRIVES ----------
db.company_drives.insertMany([
  { company: "TCS", date: new Date("2020-10-18"), students: [1, 2] },
  { company: "Infosys", date: new Date("2020-10-28"), students: [2] },
  { company: "Wipro", date: new Date("2020-11-02"), students: [3] }
]);

// ---------- ATTENDANCE ----------
db.attendance.insertMany([
  { user_id: 1, date: new Date("2020-10-20"), status: "present" },
  { user_id: 2, date: new Date("2020-10-20"), status: "absent" },
  { user_id: 3, date: new Date("2020-10-20"), status: "absent" }
]);

// ---------- CODEKATA ----------
db.codekata.insertMany([
  { user_id: 1, problems_solved: 50 },
  { user_id: 2, problems_solved: 30 },
  { user_id: 3, problems_solved: 70 }
]);

// ===============================
// QUERIES
// ===============================

// 1. Topics in October
db.topics.find({
  date: {
    $gte: new Date("2020-10-01"),
    $lte: new Date("2020-10-31")
  }
});

// Tasks in October
db.tasks.find({
  date: {
    $gte: new Date("2020-10-01"),
    $lte: new Date("2020-10-31")
  }
});

// 2. Company drives between 15 Oct and 31 Oct
db.company_drives.find({
  date: {
    $gte: new Date("2020-10-15"),
    $lte: new Date("2020-10-31")
  }
});

// 3. Company drives + students appeared
db.company_drives.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "students",
      foreignField: "user_id",
      as: "student_details"
    }
  }
]);

// 4. Problems solved by users
db.codekata.find({}, {
  user_id: 1,
  problems_solved: 1,
  _id: 0
});

// 5. Mentors with mentee count > 15
db.users.aggregate([
  {
    $group: {
      _id: "$mentor_id",
      mentee_count: { $sum: 1 }
    }
  },
  {
    $match: {
      mentee_count: { $gt: 15 }
    }
  }
]);

// 6. Absent users + task not submitted (15–31 Oct)
db.attendance.aggregate([
  {
    $match: {
      status: "absent",
      date: {
        $gte: new Date("2020-10-15"),
        $lte: new Date("2020-10-31")
      }
    }
  },
  {
    $lookup: {
      from: "tasks",
      let: { userId: "$user_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $not: { $in: ["$$userId", "$submitted_users"] }
            }
          }
        }
      ],
      as: "not_submitted_tasks"
    }
  },
  {
    $match: {
      not_submitted_tasks: { $ne: [] }
    }
  }
]);