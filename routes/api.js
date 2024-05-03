"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const Schema = mongoose.Schema;

const issueSchema = new Schema(
  {
    project: { type: String, required: true },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    created_on: {
      type: String,
      required: true,
      default: new Date().toISOString(),
    },
    updated_on: {
      type: String,
      required: true,
      default: new Date().toISOString(),
    },
    open: { type: Boolean, required: true, default: true },
  },
  { versionKey: false },
);

let Issue = mongoose.model("Issue", issueSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let project = req.params.project;
      let query = req.query;
      query.project = project;
      if (query._id) { query._id = new ObjectID(query._id)};
      if(query.open === 'true') {
        query.open = true
      } else if (query.open === 'false') {
        query.open = false
      };
      Issue.find(query)
        .select('-project')
        .exec((err, issuesFound) => {
          if (err) return console.log(err);
          res.json(issuesFound)
        })
    })

    .post(function (req, res) {
      let project = req.params.project;
      if (
        !req.body.issue_title ||
        !req.body.issue_text ||
        !req.body.created_by
      ) {
        return res.json({ error: "required field(s) missing" });
      } else {
        let datetoset = new Date().toISOString();
        let assigned_to = req.body.assigned_to ? req.body.assigned_to : "";
        let status_text = req.body.status_text ? req.body.status_text : "";
        let newIssue = new Issue({
          project: project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: assigned_to,
          status_text: status_text,
          created_on: datetoset,
          updated_on: datetoset,
          open: true,
        });

        newIssue.save((err, createdIssue) => {
          if (err) return console.log(err);
          console.log("New issue created");
          Issue.findById(createdIssue._id)
            .select("-project")
            .exec((err, issueFound) => {
              if (err) return console.log(err);
              res.json(issueFound);
            });
        });
      }
    })

    .put(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        res.json({error: 'missing _id'})
      } else {
        let numOfKeys = 0
        let updateKeys = {};
        for (const key in req.body) {
          if (req.body[key]) {
            updateKeys[key] = req.body[key]
            numOfKeys += 1
          }
        }
        if (numOfKeys == 1) {
          res.json({"error":"no update field(s) sent","_id":req.body._id});
        } else {
          let datetoset = new Date().toISOString();
          updateKeys.updated_on = datetoset;
          Issue.findByIdAndUpdate({project: project, _id: req.body._id}, updateKeys, (err, issueFound) => {
            if (err) {
              console.log(err);
              res.json({ error: 'could not update', '_id': req.body._id });
                     }
            if (!issueFound) {
              res.json({ error: 'could not update', '_id': req.body._id });
            } else {
              res.json({ result: 'successfully updated', '_id': req.body._id })
            }
          })
        }
      }
    })

    .delete(function (req, res) {
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({error: 'missing _id'})
      } else {
        Issue.findOneAndDelete({project: project, _id: req.body._id}, (err, issueDeleted) => {
          if (err) {
            console.log(err);
            res.json({error: 'could not delete', '_id': req.body._id});
          }
          if (!issueDeleted) {
            res.json({error: 'could not delete', '_id': req.body._id});
          } else {
            res.json({result: 'successfully deleted', '_id': req.body._id})
          }
          
        })
      }
    });
};
