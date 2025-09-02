import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        message: "Server could not create post because there are missing data from client"
      })
    }

    const newAssignments = {
      ...req.body,
      user_id: 1,
      status: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    };

    await connectionPool.query(
      `
        insert into assignments 
          (title, content, category, length, status, created_at, updated_at, published_at)
        values 
          ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        newAssignments.title,
        newAssignments.content,
        newAssignments.category,
        newAssignments.length,
        newAssignments.status,
        newAssignments.created_at,
        newAssignments.updated_at,
        newAssignments.published_at,
      ]
    );

    return res.status(200).json({
      message: "Created assignment sucessfully"
    })
  }
  catch (e) {
    return res.status(500).json({
      message: "Server could not create assignment because database connection"
    });
  }

});

app.get("/assignments", async (req, res) => {
  try {
    let result = await connectionPool.query(
      `
        select *
        from assignments 
      `,
      []
    );

    return res.status(200).json({
      data: result.rows
    })
  }
  catch (e) {
    console.error(e);

    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  }

});

app.get("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    let result = await connectionPool.query(
      `
        select *
        from assignments 
        where assignment_id = ($1)
      `,
      [
        assignmentId
      ]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment"
      })
    }

    return res.status(200).json({
      data: result.rows[0]
    })
  }
  catch (e) {
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const newAssignments = {
      ...req.body,
      updated_at: new Date(),

    };
    console.log(req.body);

    let result = await connectionPool.query(
      `
        update 
          assignments 
        set 
          title = $2,
          content = $3,
          category = $4,
          updated_at = $5
        where 
          assignment_id = $1
        RETURNING assignment_id
      `,
      [
        assignmentId,
        newAssignments.title,
        newAssignments.content,
        newAssignments.category,
        newAssignments.updated_at,
      ]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment"
      })
    }

    return res.status(200).json({
      message: "Updated assignment sucessfully"
    })
  }
  catch (e) {
    console.error(e);

    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    let result = await connectionPool.query(
      `
        delete from
          assignments 
        where 
          assignment_id = $1
        RETURNING assignment_id
      `,
      [
        assignmentId
      ]
    );
    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete"
      })
    }

    return res.status(200).json({
      message: "Deleted assignment sucessfully"
    })
  }
  catch (e) {
    console.error(e);

    return res.status(500).json({
      message: "Server could not delete assignment because database connection"
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
