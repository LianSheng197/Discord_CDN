# Discord CDN (Modified)
Updates any old/expired Discord download links.
- Original Author: [ShufflePerson](https://github.com/ShufflePerson/Discord_CDN)
- Original Readme: [Readme_old.md](./Readme_old.md)


# What's the differents

## Remove the GitHub Repo redirect.
Browsing the root directory or a non-existent page no longer redirects you to the GitHub Repo.
- Root will shows How To Use and some information.
- Non-existent page will return status code `404`.

## Multiple tokens is allowed.
Add multiple tokens after `TOKEN=` in the `.env` file, separated by semicolons `,`.  
Remember, don't add line breaks, but you can add unlimited spaces ` ` after the comma `,` to make it easier to read.

## File-based store is allowed.
It is now possible to save the `savedata.json` file under the project root.  
Properties:
- `data` - For redirect link cache (7 days).
- `convertCounter` - +1 if the generate new link was successful.
- `visitCounter` - +1 if the root directory was accessed once.
- `redirectCounter` - +1 for a successful redirect (includes from cache).

## Append 429's responding option
Now if encounter a 429 limit from Discord, it'll wait 3 seconds for the same token and retry.  
The error will only be responded to if it fails three times in a row.

## Append Favicon
![](./assets/favicon.png)  
Favicon is produced and licensed by `asol_studio`.  
Ref: https://www.freepik.com/icon/loop_11225541