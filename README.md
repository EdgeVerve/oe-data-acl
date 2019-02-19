## Data ACL

### Prerequisites
It is recommended to understand the concept of Loopback ACL before going through Data ACL concept. We can find the loopback ACL documentation [here](https://docs.strongloop.com/display/public/LB/Authentication%2C+authorization%2C+and+permissions).

### Overview
Standard loopback ACL feature allows to set access type (READ/WRITE) for any method of a model. However it either allows all data or none of the data to be accessed, Data ACL allows the missing feature of specifying the filter conditions on data for specific role or user.

Even if Data ACL is setup, it is mandatory to setup loopback ACL to get combined functionality, as Data ACL supports filter for ALLOW only.

Data ACL rules are described as an array of objects, each of which consists of attributes of Data ACL model

Property | Required | Description
-------- | -------- | -------------
model|Required|Model Name
principalType|Required|The type of access to apply. One of:<ul><li>USER</li><li>ROLE</li></ul>
principalId|Required|Principal identifier (Depending upon principalType). The value must be one of: <ul><li>A user ID</li><li> One of the predefined dynamic loopback roles like $everyone, $owner etc.</li><li>A static role name</li></ul>
filter|Required|Only the where part of the loopback filter object, determines which data can be accessed by user
property|Optional|Model's Method Name (create, update etc.) <p>use * or blank for all properties. <p> Example for methods on relations ``__create__addresses``, addresses is relation name here.
accessType|Optional|READ, WRITE, EXECUTE, * (for all)
group|Optional|To use a mix of and and or conditions, different group value can be used to make and condition for filters. Multiple Data ACLs with in same group are always or condition. All Data ACLs with no group value are treated as a single same group.
errorCode|optional|error code to be used for data access error

### Getting Started

To use this Data ACL feature in project from this module, you should install this module.

### Dependency
* oe-logger
* oe-cloud

### Testing and Code coverage

```sh
$ git clone http://evgit/oecloud.io/oe-data-acl.git
$ cd oe-data-acl
$ npm install --no-optional
$ npm run grunt-cover
```

you can find coverage report in coverage folder.


### Installation

To use oe-data-acl in your application, you should include this module as a dependency to your app package.json as shown below.


```javascript
"oe-data-acl": "git+http://evgit/oecloud.io/oe-data-acl.git#2.0.0"
```

You can also install this mixin on command line using npm install.


```sh
$ npm install <git path oe-data-acl> --no-optional
```


### Attaching to Application

Once you have included this module in package.json, this module will get installed as part of npm install.TO use this in your app, you need to create entry in **app-list.json** file of application.

app-list.json

```javascript

  {
    "path": "oe-data-acl",
    "enabled": true
  }
```

### Data ACL Examples
Standard ACL for allowing WRITE access on a model to role ROLE123 is given as below
```
{
      "accessType": "WRITE",
      "principalType": "ROLE",
      "principalId": "ROLE123",
      "permission": "ALLOW"
}
```

To restrict access only where category property of the model is Books, and entry in Data ACL model can be posted.
```
{
        "model": "modelABCD",
        "principalType": "ROLE",
        "principalId": "ROLE123",
        "accessType": "WRITE",
        "filter": {"category": "Books"}
}
```

The filter condition supports standard loopback conditions, which can include operators like or, and, inq etc.

Examples
```
{
    "filter": {"department": {"inq" : ["d1", "d2", "d3"]}
}
```
```
{
    "filter": {"or":[{"field1": "value1"},{"field2": "value2"}]}
}
```
```
{
     "filter": {"and":[{"field1": "value1"},{"field2": "value2"}]}
}
```

If DataACL is not defined i.e. user can access all the data provided ACL has allows it.

### Using Dynamic values in filter
For dynamic values, you can use any field from standard call context fields.
Example
```
{
     "filter": {"approver" : "@CC.username"}
}
```

You can either use @CC to access call context.

### Multiple Data ACLs
System allows multiple Data ACLs for same model and property. In case multiple Data ACLs are applicable for a given principal, filters of all Data ACLs with no group specified  are taken as OR condition.

For example following two Data ACLs will actually apply a single filter condition like ```category is Books or Music```.

```
{
        "model": "modelABCD",
        "principalType": "ROLE",
        "principalId": "ROLE123",
        "accessType": "WRITE",
        "filter": {"category": "Books"}
}
{
        "model": "modelABCD",
        "principalType": "ROLE",
        "principalId": "ROLE123",
        "accessType": "WRITE",
        "filter": {"category": "Music"}
}
```

### Usage of Group property in Data ACL

To use a mix of and and or conditions

For example following Data ACL combines to single filter ```category (Books or Music) and Country (India or Ireland)```
```
{
        "model": "modelABCD",
        "principalType": "ROLE",
        "principalId": "ROLE123",
        "accessType": "WRITE",
        "group" : "category",
        "filter": {"category": "Books"}
}
{
        "model": "modelABCD",
        "principalType": "ROLE",
        "principalId": "ROLE123",
        "accessType": "WRITE",
        "group" : "category",
        "filter": {"category": "Music"}
}
{
        "model": "modelABCD",
        "principalType": "ROLE",
        "principalId": "ROLE123",
        "accessType": "WRITE",
        "group" : "country",
        "filter": {"country": "India"}
}
{
        "model": "modelABCD",
        "principalType": "ROLE",
        "principalId": "ROLE123",
        "accessType": "WRITE",
        "group" : "country",
        "filter": {"country": "Ireland"}
}

```