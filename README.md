# anamika-gupta-wasserstoff-BackendTask

## About the project - 

Project Title: `Load Balancer for Health Care Services`

## Description:
This has implementation of a load balancer for managing requests to health care services. ( Node.js, Express.js )

Algorithm Used for load balancing - `Least connection selection`

## Features:
1.`Dynamic Endpoint Management:` The load balancer maintains a list of endpoints for both REST and GraphQL APIs, allowing for dynamic addition or removal of service instances.
2.`Request Routing:` Requests are routed to the least busy endpoint based on the current load, ensuring optimal distribution of incoming traffic.

## Steps to Run the project -

1. npm install
2. open three windows terminals
3. In  first terminal
  $env:PORT=5000
  node api.js
4. In another terminal
  $env:PORT=6000
  node api.js
5. In third terminal
   node loadBalancer.js
6. In postman make different scenarios and hit post calls to check the project.

Some random Test cases 
1. {
    "apiType":"REST",
    "serviceType": "appointment_scheduling",
    "payloadSize": 20
}

2.
{
    "apiType":"GraphQL",
    "serviceType": "appointment_scheduling",
    "payloadSize": 130

3. {
    "apiType":"GraphQL",
    "serviceType": "patient_records",
    "payloadSize": 70
}
  
