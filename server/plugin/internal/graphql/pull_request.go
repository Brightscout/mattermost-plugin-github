package graphql

import (
	"fmt"

	"github.com/google/go-github/v41/github"
	"github.com/shurcooL/githubv4"
)

const (
	queryParamPRsCursor     = "prsCursor"
	queryParamPRSearchQuery = "prSearchQueryArg"
)

// PullRequestService is responsible for handling pull request related queries
type PullRequestService service

func (p *PullRequestService) GetYourPrs() ([]*github.Issue, error) {
	params := map[string]interface{}{
		queryParamPRSearchQuery: githubv4.String(fmt.Sprintf("author:%s is:pr is:%s archived:false", p.client.username, githubv4.PullRequestStateOpen)),
		queryParamPRsCursor:     (*githubv4.String)(nil),
	}

	if p.client.org != "" {
		params[queryParamPRSearchQuery] = githubv4.String(fmt.Sprintf("org:%s %s", p.client.org, params[queryParamPRSearchQuery]))
	}

	var query prSearchQuery
	var res []*github.Issue

	for {
		if err := p.client.executeQuery(&query, params); err != nil {
			return nil, err
		}

		for _, resp := range query.Search.Nodes {
			prNumber := int(resp.PullRequest.Number)
			repositoryURL := resp.PullRequest.Repository.URL.String()
			htmlURL := resp.PullRequest.URL.String()
			title := string(resp.PullRequest.Title)
			createdAt := resp.PullRequest.CreatedAt.Time
			updatedAt := resp.PullRequest.UpdatedAt.Time
			pr := &github.Issue{
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

			res = append(res, pr)
		}

		if !query.Search.PageInfo.HasNextPage {
			break
		}

		params[queryParamPRsCursor] = githubv4.NewString(query.Search.PageInfo.EndCursor)
	}

	return res, nil
}
