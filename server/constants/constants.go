package constants

import "time"

const (
	APIErrorIDNotConnected = "not_connected"
	// TokenTTL is the OAuth token expiry duration in seconds
	TokenTTL = 600

	RequestTimeout         = 30 * time.Second
	OauthCompleteTimeout   = 2 * time.Minute
	HeaderMattermostUserID = "Mattermost-User-ID"
	OwnerQueryParam        = "owner"
	RepoQueryParam         = "repo"
	NumberQueryParam       = "number"
	PostIDQueryParam       = "postId"

	IssueStatus         = "status"
	AssigneesForProps   = "assignees"
	LabelsForProps      = "labels"
	DescriptionForProps = "description"
	TitleForProps       = "title"
	IssueNumberForProps = "issue_number"
	IssueURLForProps    = "issue_url"
	RepoOwnerForProps   = "repo_owner"
	RepoNameForProps    = "repo_name"

	Close  = "Close"
	Reopen = "Reopen"

	IssueCompleted  = "completed"
	IssueNotPlanned = "not_planned"
	IssueClose      = "closed"
	IssueOpen       = "open"

	// Actions of webhook events
	ActionOpened    = "opened"
	ActionClosed    = "closed"
	ActionReopened  = "reopened"
	ActionSubmitted = "submitted"
	ActionLabeled   = "labeled"
	ActionAssigned  = "assigned"
	ActionCreated   = "created"
	ActionDeleted   = "deleted"
	ActionEdited    = "edited"
	ActionMarkedReadyForReview = "ready_for_review"

	PostPropGithubRepo       = "gh_repo"
	PostPropGithubObjectID   = "gh_object_id"
	PostPropGithubObjectType = "gh_object_type"

	GithubObjectTypeIssue           = "issue"
	GithubObjectTypeIssueComment    = "issue_comment"
	GithubObjectTypePRReviewComment = "pr_review_comment"
)
