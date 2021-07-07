<img src="logo/banner.png" />

**Filebot** is a file manager that syncs two directories: a **replica** which acts as a mirror, and a **primary** which acts as an authority. Filebot has four goals:
1. Move any non-symlinked files that exist on the replica directory to the primary directory.
2. Symlink any files that exist on the primary directory to the replica directory.
3. Remove any files that were deleted on the primary directory from the replica directory.
4. Remove any files that were deleted on the replica directory from the primary directory (see below).

After a sync occurs Filebot takes a snapshot of the replica directory. Upon a subsequent sync any files that were removed on the replica directory will be removed from the primary directory.

### Requirements

- [Docker](https://www.docker.com/get-started)
- [GNU make](https://www.gnu.org/software/make/)

## Setup

1. Build the filebot docker images by running `make build`.
2. Create a `snapshot.json` file by running `touch snapshot.json`.

## Usage

```bash
docker run \
  --name filebot \
  --rm \
  --volume <primaryDirectoryHostPath>:<primaryDirectoryContainerPath> \
  --volume <replicaDirectoryHostPath>:<replicaDirectoryContainerPath> \
  --volume <snapshotPath>:/snapshot.json \
  nicholasodonnell/filebot:latest \
    --primary=<primaryDirectoryContainerPath> \
    --replica=<replicaDirectoryContainerPath> \
    --snapshot=/snapshot.json \
    [--safeDelete=<safeDelete>] \
    [--permissions=<permissions>] \
    [--puid=<puid>] \
    [--pgid=<pgid>]
```

```bash
node index \
  --primary=<primaryDirectoryHostPath> \
  --replica=<replicaDirectoryHostPath> \
  --snapshot=<snapshotPath> \
  [--safeDelete=<safeDelete>] \
  [--permissions=<permissions>] \
  [--puid=<puid>] \
  [--pgid=<pgid>]
```

## Options

| Option                          | Description                                                                                                                       | Default   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `primaryDirectoryHostPath`      | **Absolute** host path for the primary directory.                                                                                 | Required  |
| `primaryDirectoryContainerPath` | **Absolute** container path for the destination folder (**docker only** - any symlinked files will be to this path).              | Required  |
| `replicaDirectoryHostPath`      | **Absolute** host path for the replica directory.                                                                                 | Required  |
| `replicaDirectoryContainerPath` | **Absolute** container path for the replica folder (**docker only**).                                                             | Required  |
| `snapshotPath`                  | **Absolute** host path for the snapshot file.                                                                                     | Required  |
| `safeDelete`                    | Number of files that can be safely deleted. If filebot detects a number of deleted files greater than this, they will be ignored. | `10`      |
| `permissions`                   | CHMOD permissions of the replica directory.                                                                                       | undefined |
| `puid`                          | CHOWN user of the replica directory.                                                                                              | undefined |
| `pgid`                          | CHOWN group of the replica directory.                                                                                             | undefined |

