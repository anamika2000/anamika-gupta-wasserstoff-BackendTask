const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const healthCareApp = express();
const healthCarePort = process.env.PORT || 5000;

let activeConnections = 0;

healthCareApp.use(express.json());

healthCareApp.use((req, res, next) => {
    activeConnections++;
    res.on('finish', () => {
        activeConnections--;
    });
    next();
});

// REST Endpoints
healthCareApp.get('/patient_records', (req, res) => {
    setTimeout(() => res.send('Patient Records'), 100);  // Simulate some delay
});

healthCareApp.get('/appointment_scheduling', (req, res) => {
    setTimeout(() => res.send('Appointment Scheduling'), 200);  // Simulate some delay
});

healthCareApp.get('/load', (req, res) => {
    res.json({ activeConnections });
});

// GraphQL Schema
const graphQLSchema = buildSchema(`
  type Query {
    patientRecords: String
    appointmentScheduling: String
  }
`);

// GraphQL Root Resolver
const graphQlRoot = {
  patientRecords: () => 'Patient Records',
  appointmentScheduling: () => 'Appointment Scheduling'
};

healthCareApp.use('/graphql', graphqlHTTP({
  schema: graphQLSchema,
  rootValue: graphQlRoot,
  graphiql: true,
}));

healthCareApp.listen(healthCarePort, () => {
    console.log(`Server running on port ${healthCarePort}`);
});