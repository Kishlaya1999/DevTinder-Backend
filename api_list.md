# DevTinder APIs

## authRouter
- POST /signup
- POST /login
- POST /logout

## profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter
- POST /request/send/intereted/:userId
- POST /request/send/ignored/:userId
<!-- Above 2 apis can be combined in 1 with status in params -->
- POST /request/send/:status/:userId

- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId
<!-- Above 2 apis can be combined in 1 with status in params -->
- POST /request/review/:status/:requestId


## userRouter
- GET /user/connections
- GET /user/requests
- GET /user/feed - Gets you the profiles of other users on platform


Status: ignore, interested, accepeted, rejected