# 2018 Midterm election results server

## JSON response structure

```JavaScript
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
                    "party": String,
                    "incumbent": Boolean,
                    "winner": String,
                }
                ...
            ]
        }
        ...
    ]
}
```

Some candidate properties can only have one of a few values. Those are defined here:

 - `party`: `republican`, `democrat`, `libertarian` or `unknown`
 - `winner`: `X`: The candidate is a winner, `R`: Candidate is advancing to runoff, `N`: candidate no longer winner due to race call reversal

Also note the following:
 - A value of `false` for the `incumbent` property doesn't necessarily mean they weren't the incumbent, only that the API didn't specify. On the other hand, it will only be `true` if the API specifically declared it so.
 - The `winner` property will only exist on the object if a winner has been declared and the candidate met one of the three possible values. Losing candidates won't have a `winner` prop at all.