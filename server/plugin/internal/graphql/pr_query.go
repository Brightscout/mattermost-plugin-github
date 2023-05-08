package graphql

import (
	"github.com/shurcooL/githubv4"
)

type (
	repositoryQuery struct {
		Name          githubv4.String
		NameWithOwner githubv4.String
		URL           githubv4.URI
	}

	authorQuery struct {
		Login githubv4.String
	}

	prSearchNodes struct {
		PullRequest struct {
			Body              githubv4.String
			Mergeable         githubv4.String
			Locked            githubv4.Boolean
			Number            githubv4.Int
			AuthorAssociation githubv4.String
			CreatedAt         githubv4.DateTime
			UpdatedAt         githubv4.DateTime
			Repository        repositoryQuery
			ReviewDecision    githubv4.String
			State             githubv4.String
			Title             githubv4.String
			Author            authorQuery
			URL               githubv4.URI
		} `graphql:"... on PullRequest"`
	}

	prSearchQuery struct {
		Search struct {
			IssueCount int
			Nodes      []prSearchNodes
			PageInfo   struct {
				EndCursor   githubv4.String
				HasNextPage bool
			}
		} `graphql:"search(first:100, after:$prsCursor, query: $prSearchQueryArg, type: ISSUE)"`
	}
)
