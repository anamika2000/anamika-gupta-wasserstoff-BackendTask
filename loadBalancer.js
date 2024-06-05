const express = require('express');
const axios = require('axios');
const { performance } = require('perf_hooks');

const healthCareApp = express();
const healthCarePort = 3000;

class LoadBalancer {
  constructor() {
    this.endpoints = {
      REST: ['http://localhost:5000', 'http://localhost:6000'],
      GraphQL: ['http://localhost:5000/graphql', 'http://localhost:6000/graphql']
    };
    this.loadEndpoints = {
      REST: ['http://localhost:5000/load', 'http://localhost:6000/load'],
      GraphQL: ['http://localhost:5000/load', 'http://localhost:6000/load']
    };
    this.requestLog = [];
  }

  async getLoad(apiType) {
    console.log(this.loadEndpoints[apiType]);
    const loadPromises = this.loadEndpoints[apiType].map(url => axios.get(url).then(res => res.data.activeConnections).catch(() => Infinity));
    const loads = await Promise.all(loadPromises);
    return loads;
  }

  async getLeastBusyEndpoint(apiType,serviceType) {
    const loads = await this.getLoad(apiType);
    const minLoadIndex = loads.indexOf(Math.min(...loads));
    const baseURL = this.endpoints[apiType][minLoadIndex]
    if(apiType ==='GraphQL'){
    return baseURL ;
    }
    else{
        return `${baseURL}/${serviceType}`
    }
  }

  async routeRequest(apiType, serviceType, payloadSize) {
    const startTime = performance.now();
    const endpoint = await this.getLeastBusyEndpoint(apiType,serviceType);
    // console.log("apiType",apiType,"\nserviceType",serviceType,"\npayloadSize",payloadSize,"\nendpoint",endpoint)

    // Simulate request payload size handling
    await new Promise(resolve => setTimeout(resolve, payloadSize * 10));

    let response;
    try {
      if (apiType === 'REST') {
        response = await axios.get(endpoint);
      } else if (apiType === 'GraphQL') {
        const svc = serviceType === 'appointment_scheduling' ? 'appointmentScheduling' : serviceType === 'patient_records' ? 'patientRecords': ''
        const query = `
                query {
                    ${svc} 
                }
            `;
            response = await axios.post(endpoint, { query });
      }
    } catch (error) {
      console.error(`Error making request to ${endpoint}:, error.message`);
      return { error: error.message };
    }

    const responseTime = performance.now() - startTime;

    const logEntry = {
      apiType,
      serviceType,
      endpoint,
      responseTime,
      statusCode: response.status,
      payloadSize
    };
    this.requestLog.push(logEntry);
    console.info(`Request to ${endpoint} | Response time: ${responseTime.toFixed(2)}ms | Status: ${response.status}`);

    return response.data;
  }

  getLogs() {
    return this.requestLog;
  }
}

const loadBalancer = new LoadBalancer();

healthCareApp.use(express.json());

healthCareApp.post('/request', async (req, res) => {
  const { apiType, serviceType, payloadSize } = req.body;
  const response = await loadBalancer.routeRequest(apiType, serviceType, payloadSize);
  res.send(response);
});

healthCareApp.get('/logs', (req, res) => {
  res.send(loadBalancer.getLogs());
});

healthCareApp.listen(healthCarePort, () => {
  console.log(`Load balancer listening on port ${healthCarePort}`);
});