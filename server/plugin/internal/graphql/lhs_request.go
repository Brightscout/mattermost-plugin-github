package graphql

import (
	"fmt"

	"github.com/google/go-github/v41/github"
	"github.com/shurcooL/githubv4"
)

const (
	queryParamReviewCursor      = "reviewCursor"
	queryParamAssignmentsCursor = "assignmentsCursor"
	queryParamOpenPRsCursor     = "openPrsCursor"

	queryParamOpenPRQueryArg   = "prOpenQueryArg"
	queryParamReviewQueryArg   = "prReviewQueryArg"
	queryParamAssigneeQueryArg = "assigneeQueryArg"
)

type LHSRequestService service

func (p *LHSRequestService) GetLHSData() ([]*github.Issue, []*github.Issue, []*github.Issue, error) {
	params := map[string]interface{}{
		queryParamOpenPRQueryArg:    githubv4.String(fmt.Sprintf("author:%s is:pr is:%s archived:false", p.client.username, githubv4.PullRequestStateOpen)),
		queryParamReviewQueryArg:    githubv4.String(fmt.Sprintf("review-requested:%s is:pr is:%s archived:false", p.client.username, githubv4.PullRequestStateOpen)),
		queryParamAssigneeQueryArg:  githubv4.String(fmt.Sprintf("assignee:%s is:%s archived:false", p.client.username, githubv4.PullRequestStateOpen)),
		queryParamReviewCursor:      (*githubv4.String)(nil),
		queryParamAssignmentsCursor: (*githubv4.String)(nil),
		queryParamOpenPRsCursor:     (*githubv4.String)(nil),
	}

	if p.client.org != "" {
		params[queryParamOpenPRQueryArg] = githubv4.String(fmt.Sprintf("org:%s %s", p.client.org, params[queryParamOpenPRQueryArg]))
		params[queryParamReviewQueryArg] = githubv4.String(fmt.Sprintf("org:%s %s", p.client.org, params[queryParamReviewQueryArg]))
		params[queryParamAssigneeQueryArg] = githubv4.String(fmt.Sprintf("org:%s %s", p.client.org, params[queryParamAssigneeQueryArg]))
	}

	var resultPR, resultAssignee, resultOpenPR []*github.Issue
	flagPR, flagAssignee, flagOpenPr := false, false, false

	for {
		if flagPR && flagAssignee && flagOpenPr {
			break
		}

		if err := p.client.executeQuery(&mainQuery, params); err != nil {
			return nil, nil, nil, err
		}

		if !flagPR {
			for _, resp := range mainQuery.PullRequest.Nodes {
				pr := getPRorIssue(&resp, nil)
				resultPR = append(resultPR, pr)
			}

			if !mainQuery.PullRequest.PageInfo.HasNextPage {
				flagPR = true
			}

			params[queryParamReviewCursor] = githubv4.NewString(mainQuery.PullRequest.PageInfo.EndCursor)
		}

		if !flagAssignee {
			for _, resp := range mainQuery.Assignee.Nodes {
				prOrIssue := getPRorIssue(nil, &resp)
				resultAssignee = append(resultAssignee, prOrIssue)
			}

			if !mainQuery.Assignee.PageInfo.HasNextPage {
				flagAssignee = true
			}

			params[queryParamAssignmentsCursor] = githubv4.NewString(mainQuery.Assignee.PageInfo.EndCursor)
		}

		if !flagOpenPr {
			for _, resp := range mainQuery.OpenPullRequest.Nodes {
				pr := getPRorIssue(&resp, nil)
				resultOpenPR = append(resultOpenPR, pr)
			}

			if !mainQuery.OpenPullRequest.PageInfo.HasNextPage {
				flagOpenPr = true
			}

			params[queryParamOpenPRsCursor] = githubv4.NewString(mainQuery.OpenPullRequest.PageInfo.EndCursor)
		}
	}

	return resultPR, resultAssignee, resultOpenPR, nil
}

func getPRorIssue(prResp *prSearchNodes, assignmentResp *assignmentSearchNodes) *github.Issue {
	resp := prResp.PullRequest
	if assignmentResp != nil {
		if assignmentResp.Issue.Number == 0 {
			resp = assignmentResp.PullRequest
		}
	}

	prNumber := int(resp.Number)
	repositoryURL := resp.Repository.URL.String()
	htmlURL := resp.URL.String()
	title := string(resp.Title)
	createdAt := resp.CreatedAt.Time
	updatedAt := resp.UpdatedAt.Time
	return &github.Issue{
		Number:        &prNumber,
		RepositoryURL: &repositoryURL,
		Title:         &title,
		CreatedAt:     &createdAt,
		UpdatedAt:     &updatedAt,
		User: &github.User{
			Login: (*string)(&resp.Author.Login),
		},
		HTMLURL: &htmlURL,
	}
}
