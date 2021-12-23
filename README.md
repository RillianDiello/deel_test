# deel_test


# DEEL BACKEND TASK


## APIs To Implement 
  

Below is a list of the required API's for the application.


1. ***GET*** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

1. ***GET*** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. ***GET*** `/jobs/unpaid` -  Get all unpaid jobs for a user (***either*** a client or contractor), for ***active contracts only***.

1. ***POST*** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

Adicional route
1. ***POST*** `/balances/deposit` - Deposits money into the the the balance of a client authenticated by getProfile. The validations are equal as transfer.

1. ***POST*** `/balances/transfer/:userId` -Transfer money from balance client (Profile) to cliente (userId). A client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

1. ***GET*** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

1. ***GET*** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```


## Next Steps

* I changed some files to improve the code organization. But I have some changes that I haven't completed, like: creating a separate file for each database model.

* Make a little documentation using a Swagger (https://swagger.io/docs/open-source-tools/swagger-editor)

* Do unit tests using Jest (https://jestjs.io/)