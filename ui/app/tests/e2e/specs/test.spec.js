const specTitle = require("cypress-sonarqube-reporter/specTitle");

describe(specTitle("My First Test"), () => {
  it("Visits the app root url", () => {
    cy.visit("/");
    cy.contains("h1", "Welcome to Your Vue.js App").should("not.exist");
  });

  it("Visits the app login url", () => {
    cy.visit("/login");
    cy.contains("h1", "Welcome to Your Vue.js App").should("not.exist");
  });
});
