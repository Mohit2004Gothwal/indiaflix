require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const initializeDatabase = require("./schema");


const app = express();

app.use(express.json());
app.use(cors({ 
    origin: ["http://localhost:5173", "https://indiaflix-gold.vercel.app"] 
}));

// Get all active plans with their features
app.get("/api/plans", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.currency,
        p.billing_period,
        json_build_object(
          'features',
          COALESCE(
            json_agg(
              json_build_object(
                'id', f.id,
                'name', f.feature_name,
                'value', pf.feature_value
              )
            ) FILTER (WHERE f.id IS NOT NULL),
            '[]'::json
          )
        ) AS details
      FROM plans_table p
      LEFT JOIN plan_features pf ON pf.plan_id = p.id
      LEFT JOIN feature_table f ON f.id = pf.feature_id
      WHERE p.is_active = TRUE
      GROUP BY p.id
      ORDER BY p.id;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// Create a new plan
app.post("/api/plans", async (req, res) => {
  try {
    const { name, price, currency = "INR",
      billing_period = "Monthly" } = req.body;

    if (!name?.trim() || !Number.isInteger(price) || price < 0) {
      return res.status(400).json({
        error: "Valid name and non-negative integer price are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO plans_table
       (name, price, currency, billing_period)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), price, currency, billing_period]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A plan with this name already exists"
      });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to create plan" });
  }
});

// Update plan details
app.put("/api/plans/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, currency, billing_period } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }

    if (
      !name?.trim() ||
      !Number.isInteger(price) ||
      price < 0 ||
      !currency ||
      !billing_period
    ) {
      return res.status(400).json({
        error: "Valid name, price, currency and billing period are required"
      });
    }

    const result = await pool.query(
      `UPDATE plans_table
       SET name = $1, price = $2,
           currency = $3, billing_period = $4
       WHERE id = $5
       RETURNING *`,
      [name.trim(), price, currency, billing_period, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Plan not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "A plan with this name already exists"
      });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to update plan" });
  }
});



// ------Feature -----
// API 1 — Get all features
// Endpoint: GET /api/features
app.get("/api/features", async (req,res)=>{
    try{
       const result = await pool.query(
        `SELECT id, feature_name from feature_table order by id`
        );
        res.json(result.rows);
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Failed to fetch features"});
    }
});

// API 2 — Create a feature
// Endpoint: POST /api/features
app.post("/api/features", async (req,res)=>{
    try{
       const { feature_name } = req.body;

       if(typeof feature_name !== "string" || !feature_name.trim()){
           return res.status(400).json({
            error:"Feature name is required"
           });
        }
        const result = await pool.query(
            `INSERT INTO feature_table (feature_name)
             VALUES ($1)
             RETURNING id, feature_name`,
            [feature_name.trim()]
        );
        res.status(201).json(result.rows[0]);
        // if(result.rowCount === 0){
        //     return res.status(400).json({error: "Feature not found"});
        // }
        // res.json(result.rows[0]);
    }catch(error){
        if(error.code === "23505"){
            return res.status(409).json({
                error: "Feature name already exists"
            });
    }
    console.error(error);
    res.status(500).json({error: "Failed to update feature"});
  }
});


// API 3 — Rename a feature
// Endpoint: PUT /api/features/:id

app.put("/api/features/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { feature_name } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid feature ID" });
    }

    if (typeof feature_name !== "string" ||
        !feature_name.trim()) {
      return res.status(400).json({
        error: "Feature name is required"
      });
    }

    const result = await pool.query(
      `UPDATE feature_table
       SET feature_name = $1
       WHERE id = $2
       RETURNING id, feature_name`,
      [feature_name.trim(), id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Feature not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Feature name already exists"
      });
    }

    console.error(error);
    res.status(500).json({ error: "Failed to rename feature" });
  }
});


// API 4 — Get features for a particular plan
app.get("/api/plans/:id/features", async (req, res) => {
  try {
    const planId = Number(req.params.id);

    if (!Number.isInteger(planId) || planId <= 0) {
      return res.status(400).json({ error: "Invalid plan ID" });
    }

    const result = await pool.query(
      `SELECT
         f.id AS feature_id,
         f.feature_name,
         pf.feature_value
       FROM plan_features pf
       JOIN feature_table f ON f.id = pf.feature_id
       WHERE pf.plan_id = $1
       ORDER BY f.id`,
      [planId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch plan features"
    });
  }
});

// API 5 — Add or update a feature value for a plan
// ENDPOINT : PUT /api/plans/:id/features/:featureId
app.put(
  "/api/plans/:id/features/:featureId",
  async (req, res) => {
    try {
      const planId = Number(req.params.id);
      const featureId = Number(req.params.featureId);
      const { feature_value } = req.body;

      if (
        !Number.isInteger(planId) || planId <= 0 ||
        !Number.isInteger(featureId) || featureId <= 0
      ) {
        return res.status(400).json({
          error: "Invalid plan ID or feature ID"
        });
      }

      if (
        typeof feature_value !== "string" ||
        !feature_value.trim()
      ) {
        return res.status(400).json({
          error: "Feature value is required"
        });
      }

      const result = await pool.query(
        `INSERT INTO plan_features
           (plan_id, feature_id, feature_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (plan_id, feature_id)
         DO UPDATE SET feature_value = EXCLUDED.feature_value
         RETURNING *`,
        [planId, featureId, feature_value.trim()]
      );

      res.json(result.rows[0]);
    } catch (error) {
      if (error.code === "23503") {
        return res.status(404).json({
          error: "Plan or feature not found"
        });
      }

      console.error(error);
      res.status(500).json({
        error: "Failed to update feature value"
      });
    }
  }
);



// API 6 — Remove a feature from a plan
// ENDPOINT : DELETE /api/plans/:id/features/:featureId

app.delete(
    "/api/plans/:id/features/:featureId", async(req,res)=>{
        try{
            const planId = Number(req.params.id);
            const featureId = Number(req.params.featureId);

            if(!Number.isInteger(planId)|| planId <=0 || 
               !Number.isInteger(featureId) || featureId <=0){
                return res.status(400).json({
                    error: "Invalid plan ID or feature ID"
                });
               }

               const result = await pool.query(
                `DELETE FROM plan_features where plan_id = $1 and feature_id = $2 returning *`,
                [planId , featureId]
               );
               res.json({message: "Feature removed from plan", deleted: result.rows[0]});

        }catch(error){
              console.error(error);
              res.status(500).json({
                error: "Failed to remove feature from plan"
              });
        }
    }
);

// Activate or Deactivate a plan
app.patch("/api/plans/:id/status",async (req,res)=>{
     try{
        const id = Number(req.params.id);
        const {is_active} = req.body;

        if(!Number.isInteger(id) || id <=0){
            return res.status(400).json({error: "Invalid plan Id"});
        }
        if(typeof is_active !== "boolean"){
            return res.status(400).json({error: "is_active must be true or false"});
        }

        const result = await pool.query(
            `Update plans_table set is_active = $1 where id = $2 returning id,name , is_active`,
            [is_active,id]
        );
        if(result.rowCount === 0){
            return res.status(404).json({
                error: "Plan not found"
            });
        }
        res.json(result.rows[0]);

     }catch(error){
        console.error(error);
        res.status(500).json({
            error: "Failed to update plan status"
        });
     }
});

// Health check api
app.get("/api/health",  async(req,res)=>{
     try{
        await pool.query("SELECT 1");
        res.json({
            status: "OK",
            database: "Connected"
        });

     }catch(error){
        console.error(error);
        res.status(503).json({
            status: "Service Unavailable",
            database: "Database connection failed"
        });
     }
});

// Start server
// async function startServer() {
//   await initializeDatabase();

//   const port = process.env.PORT || 3000;

//   app.listen(port, () => {
//     console.log(`Indiaflix API running on port ${port}`);
//   });
// }

// startServer().catch(error => {
//   console.error("Failed to start server:", error);
//   process.exit(1);
// });

module.exports = app;

if (require.main === module) {
  async function startServer() {
    try {
      await initializeDatabase();

      const PORT = process.env.PORT || 3000;

      app.listen(PORT, () => {
        console.log(`IndiaFlix API running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  startServer();
}