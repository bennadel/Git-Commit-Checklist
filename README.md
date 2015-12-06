
# Git Deployment Checklist

by [Ben Nadel][bennadel] (on [Google+][googleplus])

This is a small and simple [Firebase][firebase]-powered, AngularJS application 
that helps an engineering team coordinate on a deployment to production that 
requires some degree of manual checking and confirmation.

**[Run the Git Deployment Checklist application](https://bennadel.github.io/Git-Commit-Checklist/)**

The application takes a list of git commits, like:

```txt
55ea0c3d117f9d245a925d6d8afa1ff4ee5143d2 [Sarah Smith] Fix bug in login form for plus-style addressing.
5c67dc5fea2f8dff7a6d4093fd52aff4ecc07cd3 [Kim Smith] Removed erroneous padding from error modal.
0c143bb723cf6abc8a482257aa4feff4ea1c72b7 [Ben Nadel] Delete Redis keys for invalid sessions.
c9568ac85fe11eca9af0008b7f551ff4e49cb40b [Ben Nadel] Reverting hotfix commits.
```

... and turns it into a list of toggles that automatically synchronizes across 
all clients looking at the same URL. This way, the operations teams can see 
which commits have been checked and whether or not the deployment is ready to
move forward.

## Security

The data for commits is stored in Firebase and is secured through data access 
rules and obfuscation (access and validation rules):

```js
{
    // By default, lock down all reads and writes to the entire data store. This means that
    // all access will have to be explicitly opened up to child nodes.
    "rules": {
        ".read": false,
        ".write": false,
        
        // Open up writes on the deployments subtree since anyone should be able to start
        // a new deployment and store it in the deployments collection. However, since 
        // reads are locked down, people can't "listen" for arbitrary data changes at this
        // level (such as "value" and "child_added" events).
        "deployments": {
          ".write": true,
        
          // Open reads and writes to any individual deployment since anyone with a link to 
          // the deployment URL can access it. These are pseudo-random, complex end-points and
          // are secured through obfuscation.
          "$deployment": {
              ".write": true,
              
              // NOTE: Allowing a read on non-existent data so that the UI can be notified when
              // the deployment has been nullified (ie, deleted).
              ".read": "! data.exists() || data.child( 'createdAt' ).val() >= ( now - ( 12 * 60 * 60 * 1000 ) )",
              
              // Since we are locking the read access based on time deltas, we have to ensure 
              // that all new deployments have a createdAt timestamp.
              ".validate": "newData.hasChildren( [ 'createdAt' ] ) && newData.child( 'createdAt' ).isNumber()"
          } 
        }
    }
}
```

Since there is no authentication in this application, any user with a direct 
URL to the deployment checklist can both view and modify the commit status. 
However, without a direct URL, the ability to "listen" for new deployments is 
not possible. As such, in order to inappropriately access the data you would 
have to guess a deployment URL which is based on the deployment, the time, and
a random salt value.









[bennadel]: http://www.bennadel.com
[googleplus]: https://plus.google.com/108976367067760160494?rel=author
[firebase]: https://www.firebase.com/

