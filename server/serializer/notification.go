package serializer

import "github.com/google/go-github/v48/github"

type FilteredNotification struct {
	github.Notification
	HTMLURL string `json:"html_url"`
}
