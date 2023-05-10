package graphql

import (
	"github.com/shurcooL/githubv4"
)

type (
	assignmentSearchNodes struct {
		Issue struct {
			Body              githubv4.String
			Number            githubv4.Int
			AuthorAssociation githubv4.String
			CreatedAt         githubv4.DateTime
			UpdatedAt         githubv4.DateTime
			Repository        repositoryQuery
			State             githubv4.String
			Title             githubv4.String
			Author            authorQuery
			URL               githubv4.URI
		} `graphql:"... on Issue"`

		PullRequest struct {
			Body              githubv4.String
			Number            githubv4.Int
			AuthorAssociation githubv4.String
			CreatedAt         githubv4.DateTime
			UpdatedAt         githubv4.DateTime
			Repository        repositoryQuery
			State             githubv4.String
			Title             githubv4.String
			Author            authorQuery
			URL               githubv4.URI
		} `graphql:"... on PullRequest"`
	}

	assignmentSearchQuery struct {
		Search struct {
			IssueCount int
			Nodes      []assignmentSearchNodes
			PageInfo   struct {
				EndCursor   githubv4.String
				HasNextPage bool
			}
		} `graphql:"search(first:100, after:$assignmentCursor, query: $assignmentSearchQueryArg, type: ISSUE)"`
	}
)
