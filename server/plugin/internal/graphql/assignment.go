package graphql

import (
	"fmt"
	"time"

	"github.com/google/go-github/v41/github"
	"github.com/shurcooL/githubv4"
)

const (
	queryParamAssignmentCursor      = "assignmentCursor"
	queryParamAssignmentSearchQuery = "assignmentSearchQueryArg"
)

// IssueService is responsible for handling issue related queries
type IssueService service

func (i *IssueService) GetYourAssignment() ([]*github.Issue, error) {
	params := map[string]interface{}{
		queryParamAssignmentSearchQuery: githubv4.String(fmt.Sprintf("assignee:%s  is:%s archived:false", i.client.username, githubv4.IssueStateOpen)),
		queryParamAssignmentCursor:      (*githubv4.String)(nil),
	}

	if i.client.org != "" {
		params[queryParamAssignmentSearchQuery] = githubv4.String(fmt.Sprintf("org:%s %s", i.client.org, params[queryParamAssignmentSearchQuery]))
	}

	var query assignmentSearchQuery
	var res []*github.Issue
	for {
		if err := i.client.executeQuery(&query, params); err != nil {
			return nil, err
		}

		var prOrIssue *github.Issue
		for _, resp := range query.Search.Nodes {
			response := resp.Issue
			if response.Number == 0 {
				response = resp.PullRequest
			}
			prNumber := int(response.Number)
			repositoryURL := response.Repository.URL.String()
			htmlURL := response.URL.String()
			title := string(response.Title)
			createdAt := response.CreatedAt.Time
			updatedAt := response.UpdatedAt.Time
			login := (string)(response.Author.Login)

			prOrIssue = getPRorIssue(prNumber, repositoryURL, htmlURL, title, login, createdAt, updatedAt)
			res = append(res, prOrIssue)
		}

		if !query.Search.PageInfo.HasNextPage {
			break
		}

		params[queryParamAssignmentCursor] = githubv4.NewString(query.Search.PageInfo.EndCursor)
	}

	return res, nil
}

func getPRorIssue(prNumber int, repositoryURL, htmlURL, title, login string, createdAt, updatedAt time.Time) *github.Issue {
	return &github.Issue{
		Number:        &prNumber,
		RepositoryURL: &repositoryURL,
		Title:         &title,
		CreatedAt:     &createdAt,
		UpdatedAt:     &updatedAt,
		User: &github.User{
			Login: &login,
		},
		HTMLURL: &htmlURL,
	}
}
