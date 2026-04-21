const fs = require('fs');

const collection = {
  info: {
    name: "CDC Placement-Management - Full API Collection",
    description: "Exhaustive tests and requests for all endpoints in the CDC Placement-Management service.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    {
      name: "Auth",
      item: [
        {
          name: "Register Student",
          event: [{ listen: "prerequest", script: { exec: ["pm.collectionVariables.set(\"student_email\", \"student\" + pm.variables.replaceIn('{{$randomInt}}') + \"@example.com\");", "pm.collectionVariables.set(\"student_password\", \"securepassword\");"], type: "text/javascript" } }, { listen: "test", script: { exec: ["pm.test(\"Status code is 200\", function () { pm.response.to.have.status(200); });", "var jsonData = pm.response.json(); pm.collectionVariables.set(\"student_auth_token\", jsonData.token);"], type: "text/javascript" } }],
          request: { method: "POST", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ email: "{{student_email}}", password: "{{student_password}}", role: "student", firstName: "Test", lastName: "Student", department: "Computer Science" }, null, 2) }, url: { raw: "http://localhost:8080/register", protocol: "http", host: ["localhost"], port: "8080", path: ["register"] } }
        },
        {
          name: "Register Company",
          event: [{ listen: "prerequest", script: { exec: ["pm.collectionVariables.set(\"company_email\", \"company\" + pm.variables.replaceIn('{{$randomInt}}') + \"@example.com\");", "pm.collectionVariables.set(\"company_password\", \"securepassword\");"], type: "text/javascript" } }, { listen: "test", script: { exec: ["pm.test(\"Status code is 200\", function () { pm.response.to.have.status(200); });", "var jsonData = pm.response.json(); pm.collectionVariables.set(\"company_auth_token\", jsonData.token);"], type: "text/javascript" } }],
          request: { method: "POST", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ email: "{{company_email}}", password: "{{company_password}}", role: "company" }, null, 2) }, url: { raw: "http://localhost:8080/register", protocol: "http", host: ["localhost"], port: "8080", path: ["register"] } }
        },
        {
          name: "Login User",
          request: { method: "POST", header: [{ key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ username: "{{student_email}}", password: "{{student_password}}" }, null, 2) }, url: { raw: "http://localhost:8080/login", protocol: "http", host: ["localhost"], port: "8080", path: ["login"] } }
        }
      ]
    },
    {
      name: "Users",
      item: [
        { name: "Upload Resume (Form-Data)", request: { method: "POST", header: [{ key: "Authorization", value: "Bearer {{student_auth_token}}" }], body: { mode: "formdata", formdata: [{ key: "file", type: "file", src: [] }] }, url: { raw: "http://localhost:8080/user/resume", protocol: "http", host: ["localhost"], port: "8080", path: ["user", "resume"] } } },
        { name: "Get Resume", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{student_auth_token}}" }], url: { raw: "http://localhost:8080/user/resume/1", protocol: "http", host: ["localhost"], port: "8080", path: ["user", "resume", "1"] } } },
        { name: "Get Profile", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{student_auth_token}}" }], url: { raw: "http://localhost:8080/user/profile", protocol: "http", host: ["localhost"], port: "8080", path: ["user", "profile"] } } },
        { name: "Update Profile", request: { method: "PUT", header: [{ key: "Authorization", value: "Bearer {{student_auth_token}}"}, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ cgpa: 3.8, backlogCount: 0, skills: "Java, React" }, null, 2) }, url: { raw: "http://localhost:8080/user/profile", protocol: "http", host: ["localhost"], port: "8080", path: ["user", "profile"] } } }
      ]
    },
    {
      name: "Jobs",
      item: [
        { name: "Get All Jobs", request: { method: "GET", header: [], url: { raw: "http://localhost:8080/jobs", protocol: "http", host: ["localhost"], port: "8080", path: ["jobs"] } } },
        { name: "Post a Job", event: [{ listen: "test", script: { exec: ["var jsonData = pm.response.json(); pm.collectionVariables.set(\"test_job_id\", jsonData.id);"], type: "text/javascript" } }], request: { method: "POST", header: [{ key: "Authorization", value: "Bearer {{company_auth_token}}"}, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ title: "Software Engineer", description: "Remote Work", location: "Remote", salary: "120000", requiredCgpa: 3.0 }, null, 2) }, url: { raw: "http://localhost:8080/jobs", protocol: "http", host: ["localhost"], port: "8080", path: ["jobs"] } } },
        { name: "Update Job", request: { method: "PUT", header: [{ key: "Authorization", value: "Bearer {{company_auth_token}}"}, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ salary: "130000" }, null, 2) }, url: { raw: "http://localhost:8080/jobs/{{test_job_id}}", protocol: "http", host: ["localhost"], port: "8080", path: ["jobs", "{{test_job_id}}"] } } },
        { name: "Delete Job", request: { method: "DELETE", header: [{ key: "Authorization", value: "Bearer {{company_auth_token}}"}], url: { raw: "http://localhost:8080/jobs/{{test_job_id}}", protocol: "http", host: ["localhost"], port: "8080", path: ["jobs", "{{test_job_id}}"] } } },
        { name: "Add Job Stage", request: { method: "POST", header: [{ key: "Authorization", value: "Bearer {{company_auth_token}}"}, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ stageName: "Technical Interview", stageOrder: 1 }, null, 2) }, url: { raw: "http://localhost:8080/jobs/{{test_job_id}}/stages", protocol: "http", host: ["localhost"], port: "8080", path: ["jobs", "{{test_job_id}}", "stages"] } } },
        { name: "Get Job Stages", request: { method: "GET", header: [], url: { raw: "http://localhost:8080/jobs/{{test_job_id}}/stages", protocol: "http", host: ["localhost"], port: "8080", path: ["jobs", "{{test_job_id}}", "stages"] } } },
        { name: "Delete Job Stage", request: { method: "DELETE", header: [{ key: "Authorization", value: "Bearer {{company_auth_token}}"}], url: { raw: "http://localhost:8080/jobs/stages/1", protocol: "http", host: ["localhost"], port: "8080", path: ["jobs", "stages", "1"] } } }
      ]
    },
    {
      name: "Applications",
      item: [
        { name: "Get Applications (Student)", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{student_auth_token}}"}], url: { raw: "http://localhost:8080/applications", protocol: "http", host: ["localhost"], port: "8080", path: ["applications"] } } },
        { name: "Get Applications By Job Id (Company)", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{company_auth_token}}"}], url: { raw: "http://localhost:8080/applications?jobId={{test_job_id}}", protocol: "http", host: ["localhost"], port: "8080", path: ["applications"], query: [{ key: "jobId", value: "{{test_job_id}}" }] } } },
        { name: "Apply to Job", event: [{ listen: "test", script: { exec: ["var jsonData = pm.response.json(); pm.collectionVariables.set(\"test_app_id\", jsonData.id);"], type: "text/javascript" } }], request: { method: "POST", header: [{ key: "Authorization", value: "Bearer {{student_auth_token}}"}, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ jobId: "{{test_job_id}}" }, null, 2).replace('"{{test_job_id}}"', 'pm.collectionVariables.get("test_job_id")') }, url: { raw: "http://localhost:8080/applications", protocol: "http", host: ["localhost"], port: "8080", path: ["applications"] } } },
        { name: "Update Application Status", request: { method: "PUT", header: [{ key: "Authorization", value: "Bearer {{company_auth_token}}"}, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ status: "ACCEPTED", currentStage: "Final" }, null, 2) }, url: { raw: "http://localhost:8080/applications/{{test_app_id}}", protocol: "http", host: ["localhost"], port: "8080", path: ["applications", "{{test_app_id}}"] } } },
        { name: "Upload Offer Letter", request: { method: "POST", header: [{ key: "Authorization", value: "Bearer {{company_auth_token}}"}], body: { mode: "formdata", formdata: [{ key: "file", type: "file", src: [] }] }, url: { raw: "http://localhost:8080/applications/{{test_app_id}}/offer", protocol: "http", host: ["localhost"], port: "8080", path: ["applications", "{{test_app_id}}", "offer"] } } },
        { name: "Download Offer Letter", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{student_auth_token}}"}], url: { raw: "http://localhost:8080/applications/{{test_app_id}}/offer", protocol: "http", host: ["localhost"], port: "8080", path: ["applications", "{{test_app_id}}", "offer"] } } }
      ]
    },
    {
      name: "Admin",
      item: [
        { name: "Get Overall Stats", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{admin_auth_token}}"}], url: { raw: "http://localhost:8080/admin/stats", protocol: "http", host: ["localhost"], port: "8080", path: ["admin", "stats"] } } },
        { name: "Get All Users", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{admin_auth_token}}"}], url: { raw: "http://localhost:8080/admin/users", protocol: "http", host: ["localhost"], port: "8080", path: ["admin", "users"] } } },
        { name: "Get All Applications", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{admin_auth_token}}"}], url: { raw: "http://localhost:8080/admin/applications", protocol: "http", host: ["localhost"], port: "8080", path: ["admin", "applications"] } } },
        { name: "Get Company Stats", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{admin_auth_token}}"}], url: { raw: "http://localhost:8080/admin/company-stats", protocol: "http", host: ["localhost"], port: "8080", path: ["admin", "company-stats"] } } },
        { name: "Get Department Reports", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{admin_auth_token}}"}], url: { raw: "http://localhost:8080/admin/reports/department", protocol: "http", host: ["localhost"], port: "8080", path: ["admin", "reports", "department"] } } },
        { name: "Get Student Reports", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{admin_auth_token}}"}], url: { raw: "http://localhost:8080/admin/reports/student", protocol: "http", host: ["localhost"], port: "8080", path: ["admin", "reports", "student"] } } },
        { name: "Delete User", request: { method: "DELETE", header: [{ key: "Authorization", value: "Bearer {{admin_auth_token}}"}], url: { raw: "http://localhost:8080/admin/users/1", protocol: "http", host: ["localhost"], port: "8080", path: ["admin", "users", "1"] } } }
      ]
    },
    {
      name: "Feedback",
      item: [
        { name: "Submit Feedback", request: { method: "POST", header: [{ key: "Authorization", value: "Bearer {{student_auth_token}}"}, { key: "Content-Type", value: "application/json" }], body: { mode: "raw", raw: JSON.stringify({ message: "This is a great system!", rating: 5 }, null, 2) }, url: { raw: "http://localhost:8080/feedback", protocol: "http", host: ["localhost"], port: "8080", path: ["feedback"] } } },
        { name: "Get All Feedback (Admin)", request: { method: "GET", header: [{ key: "Authorization", value: "Bearer {{admin_auth_token}}"}], url: { raw: "http://localhost:8080/feedback", protocol: "http", host: ["localhost"], port: "8080", path: ["feedback"] } } }
      ]
    },
    {
      name: "Misc",
      item: [
        { name: "Test Server Flow", request: { method: "GET", header: [], url: { raw: "http://localhost:8080/api/test", protocol: "http", host: ["localhost"], port: "8080", path: ["api", "test"] } } }
      ]
    }
  ]
};

// Fix the replace logic for dynamic integers
let collectionJson = JSON.stringify(collection, null, 2);
collectionJson = collectionJson.replace('"pm.collectionVariables.get(\\"test_job_id\\")"', '{{test_job_id}}'); // revert any weird JSON.stringify injection

fs.writeFileSync('C:/Users/ashwi/Desktop/1/CDC Placement-Management/cdc-api-tests.postman_collection.json', collectionJson);
console.log('Postman file completely generated');
