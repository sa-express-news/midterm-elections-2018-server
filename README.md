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
                    "winner": Boolean,
                }
                ...
            ]
        }
        ...
    ]
}
```

The `party` candidate property can only have one four values. Those are defined here:

 - `republican`, `democrat`, `libertarian` or `unknown`

Also note the following:
 - A value of `false` for the `incumbent` property doesn't necessarily mean they weren't the incumbent, only that the API didn't specify. On the other hand, it will only be `true` if the API specifically declared it so.
 - The `winner` property will be `false` for all candidates until a winner is declared.