Startup 
```
npm i -- forst time
npm run dev
```

### DB requirements

Users {
    id, user_id (uuid) ,name, email, invite_link, emoji
}

User_profile {
    id, user_id, bio, .. resume data
}

industry (3 tier struct)
management_roles
user_industry (fk relation + years exp)

skill_set (3 tier) (tech, non tech -> leadership, python)
user_skillset

user_location (use geocding here just incase we need to prefer country wise or near me thingy)
// not now but in future
