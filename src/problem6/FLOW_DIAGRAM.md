# Live Leaderboard Execution Flow Diagram

```
┌─────────────┐                                 ┌───────────────────┐                            ┌─────────────────┐
│             │                                 │                   │                            │                 │
│   Client    │                                 │ Authentication    │                            │  Score Service  │
│   Browser   │                                 │     Service       │                            │                 │
│             │                                 │                   │                            │                 │
└──────┬──────┘                                 └─────────┬─────────┘                            └────────┬────────┘
       │                                                  │                                               │
       │                                                  │                                               │
       │   1. User Login Request                          │                                               │
       │ ─────────────────────────────────────────────────>                                               │
       │                                                  │                                               │
       │   2. Return JWT Token                            │                                               │
       │ <─────────────────────────────────────────────────                                               │
       │                                                  │                                               │
       │                                                  │                                               │
       │   3. User performs scoring action                │                                               │
       │   and sends update request with JWT              │                                               │
       │ ──────────────────────────────────────────────────────────────────────────────────────────────────>
       │                                                  │                                               │
       │                                                  │   4. Validate JWT Token                       │
       │                                                  │ <─────────────────────────────────────────────
       │                                                  │                                               │
       │                                                  │   5. Token Validation Response                │
       │                                                  │ ─────────────────────────────────────────────>
       │                                                  │                                               │
       │                                                  │                                               │
       │                                                  │                                               │  6. Validate Action
       │                                                  │                                               │     & Update Score
       │                                                  │                                               │  ┌───────────────┐
       │                                                  │                                               │  │               │
       │                                                  │                                               │  │               │
       │                                                  │                                               │  │               │
       │                                                  │                                               │  └───────────────┘
       │                                                  │                                               │
       │                                                  │                                               │
┌──────┴──────┐                                 ┌─────────┴─────────┐                            ┌────────┴────────┐
│             │                                 │                   │                            │                 │
│   Client    │                                 │  Authentication   │                            │  Score Service  │
│   Browser   │                                 │     Service       │                            │                 │
│             │                                 │                   │                            │                 │
└──────┬──────┘                                 └───────────────────┘                            └────────┬────────┘
       │                                                                                                  │
       │                                                                                                  │
       │  9. Score Update Response                                                                        │
       │ <─────────────────────────────────────────────────────────────────────────────────────────────────
       │                                                                                                  │
       │                                                                                                  │
       │                                                 ┌───────────────────┐                            │
       │                                                 │                   │                            │  7. Publish Score
       │                                                 │   Leaderboard     │                            │     Update Event
       │                                                 │     Service       │ <───────────────────────────
       │                                                 │                   │                            │
       │                                                 └─────────┬─────────┘                            │
       │                                                           │                                      │
       │                                                           │  8. Update Leaderboard              │
       │                                                           │  ┌───────────────┐                  │
       │                                                           │  │               │                  │
       │                                                           │  │               │                  │
       │                                                           │  │               │                  │
       │                                                           │  └───────────────┘                  │
       │                                                           │                                      │
       │                                                           │                                      │
       │                                                 ┌─────────┴─────────┐              ┌─────────────┴──────────┐
       │                                                 │                   │              │                        │
       │                                                 │   Leaderboard     │              │      Score Service     │
       │                                                 │     Service       │              │                        │
       │                                                 │                   │              │                        │
       │                                                 └─────────┬─────────┘              └────────────────────────┘
       │                                                           │
       │                                                           │
       │                                                           │
       │                                                 ┌─────────┴─────────┐
       │                                                 │                   │
       │                                                 │    WebSocket      │
       │                                                 │     Service       │
       │                                                 │                   │
       │                                                 └─────────┬─────────┘
       │                                                           │
       │                                                           │
       │  10. Real-time Leaderboard Update via WebSocket           │
       │ <─────────────────────────────────────────────────────────
       │                                                           │
┌──────┴──────┐                                                    │
│             │                                                    │
│   Client    │                                            ┌───────┴───────┐
│   Browser   │                                            │ WebSocket     │
│             │                                            │ Service       │
└─────────────┘                                            └───────────────┘
```

## Explanation of Flow

1. **Authentication Flow**:
   - User logs in through the frontend application
   - Authentication Service validates credentials and issues a JWT token
   - Frontend stores the JWT token for subsequent requests

2. **Score Update Flow**:
   - User performs a score-increasing action in the frontend
   - Frontend sends action details with JWT token to Score Service
   - Score Service validates the JWT with Authentication Service
   - Score Service validates the action and updates the user's score
   - Score Service publishes a score update event

3. **Leaderboard Update Flow**:
   - Leaderboard Service receives score update event
   - Leaderboard Service updates the cached leaderboard if needed
   - Leaderboard Service notifies WebSocket Service of changes

4. **Real-time Client Update Flow**:
   - WebSocket Service broadcasts updated leaderboard to connected clients
   - Client frontend receives update and refreshes the displayed leaderboard

## Critical Path Security Measures

1. **JWT token validation** ensures only authenticated users can submit scores
2. **Action validation** verifies the legitimacy of the score-increasing action
3. **Server-side score calculation** prevents client-side tampering with scores
4. **Rate limiting** prevents users from submitting too many actions too quickly