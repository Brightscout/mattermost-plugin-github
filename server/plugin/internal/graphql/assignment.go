package graphql

import (
	"fmt"

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
			if resp.Issue.Number != 0 {
				prNumber := int(resp.Issue.Number)
				repositoryURL := resp.Issue.Repository.URL.String()
				htmlURL := resp.Issue.URL.String()
				title := string(resp.Issue.Title)
				createdAt := resp.Issue.CreatedAt.Time
				updatedAt := resp.Issue.UpdatedAt.Time
				prOrIssue = &github.Issue{
					Number:        &prNumber,
					RepositoryURL: &repositoryURL,
					Title:         &title,
					CreatedAt:     &createdAt,
					UpdatedAt:     &updatedAt,
					User: &github.User{
						Login: (*string)(&resp.Issue.Author.Login),
					},
					HTMLURL: &htmlURL,
				}
			} else {
				prNumber := int(resp.PullRequest.Number)
				repositoryURL := resp.PullRequest.Repository.URL.String()
				htmlURL := resp.PullRequest.URL.String()
				title := string(resp.PullRequest.Title)
				createdAt := resp.PullRequest.CreatedAt.Time
				updatedAt := resp.PullRequest.UpdatedAt.Time
				prOrIssue = &github.Issue{
					Number:        &prNumber,
					RepositoryURL: &repositoryURL,
					Title:         &title,
					CreatedAt:     &createdAt,
					UpdatedAt:     &updatedAt,
					User: &github.User{
						Login: (*string)(&resp.PullRequest.Author.Login),
					},
					HTMLURL: &htmlURL,
				}
			}

			res = append(res, prOrIssue)
		}

		if !query.Search.PageInfo.HasNextPage {
			break
		}

		params[queryParamAssignmentCursor] = githubv4.NewString(query.Search.PageInfo.EndCursor)
	}

	return res, nil
}
