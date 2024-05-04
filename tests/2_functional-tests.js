const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
let testId = "6634db921a9844bc431a374b";
trialIssue = {
  created_on: "2024-01-01T12:00:00.000Z",
  updated_on: "2024-01-01T17:30:00.000Z",
  open: false,
  _id: "6634db921a9844bc431a374b",
  issue_title: "I hope this works",
  issue_text: "Blah blah",
  created_by: "Man U. Al",
  assigned_to: "adfssdaf",
  status_text: "Out of ideas",
};

chai.use(chaiHttp);

suite("Functional Tests", function () {
  // Create an issue with every field: POST request to /api/issues/{project}
  test("Testing POST request with every field", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/testdata")
      .send({
        issue_title: "testissue",
        issue_text: "can i create issue",
        created_by: "mocha",
        assigned_to: "chai",
        status_text: "waiting to do",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          _id: res.body._id,
          issue_title: "testissue",
          issue_text: "can i create issue",
          created_by: "mocha",
          assigned_to: "chai",
          status_text: "waiting to do",
          created_on: res.body.created_on,
          updated_on: res.body.updated_on,
          open: true,
        });
        testId = res.body._id;
        done();
      });
  });

  // Create an issue with only required fields: POST request to /api/issues/{project}
  test("Testing POST request with only required fields", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/testdata")
      .send({
        issue_title: "secondtest",
        issue_text: "creating with missing",
        created_by: "mysteryman",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          _id: res.body._id,
          issue_title: "secondtest",
          issue_text: "creating with missing",
          created_by: "mysteryman",
          assigned_to: "",
          status_text: "",
          created_on: res.body.created_on,
          updated_on: res.body.updated_on,
          open: true,
        });
        testId = res.body._id;
        done();
      });
  });

  // Create an issue with missing required fields: POST request to /api/issues/{project}
  test("Testing POST request with missing required fields", (done) => {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/testdata")
      .send({
        issue_title: "thirdtest",
        issue_text: "should not appear at all",
        assigned_to: "Mongoose Moose",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "required field(s) missing" });
        done();
      });
  });

  // View issues on a project: GET request to /api/issues/{project}
  test("Testing GET request on /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/testdata")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.includeDeepMembers(res.body, [trialIssue]);
        assert.isAtLeast(res.body.length, 1);
        done();
      });
  });

  // View issues on a project with one filter: GET request to /api/issues/{project}
  test("Testing GET request with one filter", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/testdata?issue_title=I%20hope%20this%20works")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.deepEqual(res.body, [trialIssue]);
        assert.equal(res.body.length, 1);
        done();
      });
  });

  // View issues on a project with multiple filters: GET request to /api/issues/{project}
  test("Testing GET request with multiple filters", (done) => {
    chai
      .request(server)
      .keepOpen()
      .get(
        "/api/issues/testdata?issue_text=Blah%20blah&status_text=Out%20of%20ideas&assigned_to=adfssdaf&open=false",
      )
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.deepEqual(res.body, [trialIssue]);
        assert.equal(res.body.length, 1);
        done();
      });
  });

  // Update one field on an issue: PUT request to /api/issues/{project}
  test("Testing PUT request to update one field", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testdata")
      .send({ _id: testId, status_text: "Issue updated but not solved" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: testId,
        });
        done();
      });
  });

  // Update multiple fields on an issue: PUT request to /api/issues/{project}
  test("Testing PUT request to update multiple fields", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testdata")
      .send({
        _id: testId,
        issue_text: "I am lazy",
        assigned_to: "Anyone else",
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: testId,
        });
        done();
      });
  });

  // Update an issue with missing _id: PUT request to /api/issues/{project}
  test("Testing PUT request with missing _id", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testdata")
      .send({ issue_title: "This should not work" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });

  // Update an issue with no fields to update: PUT request to /api/issues/{project}
  test("Testing PUT request with no fields", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testdata")
      .send({ _id: testId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: "no update field(s) sent",
          _id: testId,
        });
        done();
      });
  });

  // Update an issue with an invalid _id: PUT request to /api/issues/{project}
  test("Testing PUT request with invalid _id", (done) => {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testdata")
      .send({ _id: "666666666666666666666666", open: "false" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: "could not update",
          _id: "666666666666666666666666",
        });
        done();
      });
  });

  // Delete an issue: DELETE request to /api/issues/{project}
  test("Testing DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testdata")
      .send({ _id: testId })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: "successfully deleted",
          _id: testId,
        });
        done();
      });
  });

  // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
  test("Testing DELETE request with invalid _id", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testdata")
      .send({ _id: "666666666666666666666666" })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: "could not delete",
          _id: "666666666666666666666666",
        });
        done();
      });
  });

  // Delete an issue with missing _id: DELETE request to /api/issues/{project}
  test("Testing DELETE request to /api/issues/{project}", (done) => {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testdata")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });
});
