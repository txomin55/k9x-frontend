const specTitle = require("cypress-sonarqube-reporter/specTitle");

describe(specTitle("My First Test"), () => {
  it("Visits the app root url", () => {
    cy.visit("/");
    cy.contains("h1", "My REACT PWA").should("exist");
  });
});
