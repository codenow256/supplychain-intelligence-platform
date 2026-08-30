SupplyChainIQ — Project Progress

Project

SupplyChainIQ — Supply Chain Bottleneck Detection and Inventory Optimization Platform

Objective

Build a MongoDB-based supply-chain intelligence platform that manages products, suppliers, warehouses, inventory, orders, shipments and inventory transactions, while demonstrating practical MongoDB capabilities for supply-chain analysis, bottleneck detection and inventory optimization.

Current Architecture

Client / Postman
       ↓
Express.js Server
       ↓
Routes
       ↓
Controllers
       ↓
Mongoose Models
       ↓
MongoDB Atlas
       ↓
Collections + Indexes + Aggregation

Core Collections

The current database consists of 7 core collections:

Product

Supplier

Warehouse

Inventory

Order

Shipment

InventoryTransaction

These collections form the core supply-chain data model.

Core Data Relationships

The relationships are represented using both MongoDB ObjectId references and application-level business IDs.

                         SUPPLIER
                            ↑
                            │
PRODUCT ───────────────→ ORDER
   │                       │
   │                       ├──→ WAREHOUSE
   │                       │
   │                       └──→ items[]
   │                              └──→ PRODUCT
   │
   └──────────────→ INVENTORY ←──────── WAREHOUSE

ORDER
  │
  ↓
SHIPMENT

PRODUCT + WAREHOUSE
        ↓
INVENTORY TRANSACTION

Order Relationship Design

The Order collection demonstrates both referencing and embedding:

Order
├── supplierId → Supplier (ObjectId reference)
├── warehouseId → Warehouse (ObjectId reference)
└── items[]
      ├── productId → Product (ObjectId reference)
      ├── quantity
      └── unitPrice

Inventory, Shipment and InventoryTransaction currently use business-level String IDs for their corresponding relationships.

Functionalities

1. Data Modelling — Embedding + Referencing

Status: COMPLETED

Referencing

Independent entities such as Product, Supplier and Warehouse are maintained as separate documents and referenced from transactional data where required.

The Order model uses Mongoose ObjectId references for:

Supplier

Warehouse

Product

Embedding

Order-specific item information is embedded inside the Order document.

Order
├── supplier reference
├── warehouse reference
└── items[]
      ├── product reference
      ├── quantity
      └── unitPrice

Reasoning

Referencing is suitable for independently managed and reusable entities.

Embedding is suitable for tightly coupled order-item information that is normally accessed together with its parent order.

Demonstration

MongoDB Atlas can be used to show the stored Order structure, while the API demonstrates retrieval of the Order and its related referenced documents using Mongoose populate().

2. CRUD Operations

Status: COMPLETED / CORE APIs IMPLEMENTED

Implemented REST operations:

Create

Read/List

Read by ID

Update

Delete

Product CRUD was implemented and tested through Postman.

CRUD route/controller structures have also been established for the remaining core collections.

3. Indexing + Query Optimization

Status: COMPLETED

Business Query

Retrieve inventory transactions for a particular product at a particular warehouse.

db.inventorytransactions.find({
    productId: "P001",
    warehouseId: "WH001"
})

Dataset

20,000 InventoryTransaction documents were generated for realistic query testing.

Before Index

Execution plan:

COLLSCAN

Results returned:

35

Documents examined:

20,000

Keys examined:

0

Execution time:

12 ms

Compound Index

Created:

inventoryTransactionSchema.index({
    productId: 1,
    warehouseId: 1
});

After Index

Execution plan:

IXSCAN → FETCH

Results returned:

35

Documents examined:

35

Keys examined:

35

Execution time:

0 ms

Key Result

The same query changed from:

COLLSCAN
20,000 documents examined

to:

IXSCAN
35 documents examined

The optimization was verified using:

explain("executionStats")

Backend Demonstration

The optimized query was exposed through:

GET /api/inventory-transactions/product/P001/warehouse/WH001

and successfully tested through Postman.

4. Aggregation & Analytical Processing

Status: IN PROGRESS

Initial aggregation pipeline tested using MongoDB:

$group
   ↓
$sum
   ↓
$sort

Initial objective:

Calculate total inventory movement by product.

Next step is to convert the aggregation into a meaningful SupplyChainIQ analytical API and extend it toward inventory and supplier analysis.

5. Multi-Document ACID Transactions

Status: UPCOMING

Planned use case:

Maintain consistency when multiple related inventory/order documents must be updated together.

Concepts to demonstrate:

MongoDB sessions

Transactions

Commit

Abort

Atomicity

Consistency

6. Bulk Write Operations

Status: UPCOMING

Planned use:

Efficiently process multiple inventory or transaction updates using MongoDB bulk operations.

Concepts:

bulkWrite()

insertMany()

Batch processing

Reduced database round trips

7. Advanced Filtering and Querying

Status: UPCOMING

Implement useful multi-condition supply-chain queries involving:

Product

Warehouse

Supplier

Inventory level

Transaction type

Order status

Shipment status

Date ranges

8. Pagination

Status: UPCOMING

Implement paginated retrieval for large datasets such as:

Orders

Shipments

Inventory transactions

Demonstrate:

skip()

limit()

Page size

Page number

Efficient large-result handling

9. Text Search

Status: UPCOMING

Implement text-based product/supplier search using MongoDB text indexes.

Example use case:

Search products by name or relevant text fields.

10. Geospatial Queries

Status: UPCOMING

Extend warehouse/supplier location modelling to support geographical queries.

Potential use cases:

Find nearby warehouses

Find suppliers near a warehouse

Analyze geographical supply-chain distribution

11. MongoDB Views

Status: UPCOMING

Create read-only database views for frequently required analytical information.

Potential use case:

Create a consolidated view combining inventory and product information for reporting.

12. Change Streams

Status: UPCOMING

Use MongoDB Change Streams to detect real-time changes to operational data.

Potential use case:

Monitor inventory changes and trigger application-level responses.

13. Historical / Data Lifecycle Analysis

Status: UPCOMING

Use historical InventoryTransaction and Shipment data to analyze:

Inventory movement

Supplier performance

Delivery delays

Historical trends

Stock movement patterns

Current Status

Area

Status

Backend architecture

COMPLETE

MongoDB Atlas connection

COMPLETE

7 core collection models

COMPLETE

Core route/controller structure

COMPLETE

Product CRUD

COMPLETE

Core CRUD implementation

COMPLETE

Referencing + Embedding

COMPLETE

populate()

COMPLETE

Connected sample dataset

COMPLETE

Indexing

COMPLETE

Query optimization

COMPLETE

explain("executionStats")

COMPLETE

Optimized inventory transaction API

COMPLETE

Aggregation

IN PROGRESS

ACID Transactions

UPCOMING

Bulk Writes

UPCOMING

Advanced Queries

UPCOMING

Pagination

UPCOMING

Text Search

UPCOMING

Geospatial Queries

UPCOMING

MongoDB Views

UPCOMING

Change Streams

UPCOMING

Historical Analysis

UPCOMING

Bottleneck Detection

UPCOMING

Inventory Optimization

UPCOMING

Dashboard

UPCOMING

Current Learning

Backend

Node.js

Express.js

REST APIs

HTTP methods

HTTP status codes

JSON request/response

Routes

Controllers

Route parameters

Environment variables

Postman API testing

MongoDB / Mongoose

MongoDB Atlas

Databases

Collections

Documents

Fields

ObjectId

Mongoose

Schemas

Models

CRUD

Embedding

Referencing

populate()

Compound indexes

COLLSCAN

IXSCAN

FETCH

explain("executionStats")

Query optimization

Aggregation pipelines

$group

$sum

$sort

Database Design Thinking

Learned to approach database functionality through:

Business Requirement
        ↓
Data Model
        ↓
Query / Operation
        ↓
Measure
        ↓
Optimize
        ↓
Verify
        ↓
Expose through API

Team Development

GitHub repository

Git clone

Git pull

Git push

Commits

Shared backend development

.gitignore

Environment variable protection

Key Interview-Level Learnings

Referencing vs Embedding

Use embedding when related data is tightly coupled and usually accessed together.

Use referencing when entities are independent, reusable or potentially large.

Compound Index

An index containing multiple fields, designed according to an actual query pattern.

COLLSCAN

MongoDB scans collection documents to find matching records.

IXSCAN

MongoDB uses an index to locate relevant records.

Query Optimization

The process of improving query execution by analyzing query patterns and execution plans and choosing appropriate indexes or query structures.

explain("executionStats")

Used to inspect how MongoDB executed a query and measure statistics such as documents examined, keys examined and execution time.

Aggregation

Allows MongoDB to process and transform data through a sequence of pipeline stages to produce analytical results.

Next Immediate Steps

Complete Aggregation & Analytical Processing.

Convert aggregation into backend API functionality.

Add additional meaningful analytical queries.

Implement ACID transaction functionality.

Implement Bulk Write functionality.

Continue remaining advanced MongoDB functionalities.

Build bottleneck detection logic.

Build inventory risk/optimization logic.

Complete API testing and Atlas demonstrations.

Prepare final documentation, demonstration and viva explanation.