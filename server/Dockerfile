FROM golang:1.9-alpine

# GOPATH = /go in the golang image
# also $GOPATH/bin has been added to path

WORKDIR /go/src/github.com/loganwilliams/glenecho/server

# copy server src to WORKDIR in container
COPY . .

# since we need to install a go binary (fresh, an fs watcher for development)
# we need to install git, go get the fs watcher, and delete git to reduce image space
RUN apk add --no-cache git \
&& go get github.com/pilu/fresh \
&& go get github.com/caarlos0/env \
&& go get github.com/goji/httpauth \
&& go get github.com/gorilla/mux \
&& go get github.com/lib/pq \
&& apk del git

# compile and install server binary within container
RUN go install -v

# expose port
EXPOSE 8080

# run the fs watcher, fresh, to recompile go files on all changes
CMD ["fresh"]