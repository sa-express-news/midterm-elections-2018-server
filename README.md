# 2018 Midterm election results server

## JSON response structure

```
{
    "races": [
        {
            "id": Number,
            "title": String,
            "isNational": Boolean,
            "candidates": [
                {
                    "name": String,
                    "votes": Number,
                    // possible vals for "party": 'republican' || 'democrat' || 'libertarian' || 'unknown'
                    "party": String,
                    // a value of 'false' for "incumbent" doesn't necessarily mean they weren't the incumbent, only that the API didn't specify
                    "incumbent": Boolean,
                    // "winner" will only exist if winner has been declared and candidate is winner
                    // possible values: 'X': The candidate is a winner, 'R': Candidate is advancing to runoff, 'N': candidate no longer winner due to race call reversal
                    "winner": String,
                }
                ...
            ]
        }
        ...
    ]
}
```