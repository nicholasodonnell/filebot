<img src="logo/banner.png" />

**Filebot** is a file manager that mirrors two directories. Filebot has four goals:
1. Move any non-symlinked files that exist on the source directory to the destination directory.
2. Symlink any files that exist on the destination directory to the source directory.
3. Remove any files that exist on the source directory but not the destination directory.
4. Remove any files that were deleted on the source directory (since the previous run) from the destination directory.

### Requirements

- [Docker](https://www.docker.com/get-started)
- [GNU make](https://www.gnu.org/software/make/)

## Setup

1. Build the filebot docker images by running `make build`.
2. Create a `snapshot.json` file.

## Usage

```bash
make run \
  soureDirectoryHostPath=<path> \
  sourceDirectoryContainerPath=<path> \
  destinationDirectoryHostPath=<path> \
  destinationDirectoryContainerPath=<path> \
  snapshotPath=<path> \
  [safeDelete=<number>]
```

## Options

| Option                              | Description                                                                                        | Default  |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| `soureDirectoryHostPath`            | **Absolute** host path for the source directory.                                                   | Required |
| `sourceDirectoryContainerPath`      | **Absolute** container path for the source folder.                                                 | Required |
| `destinationDirectoryHostPath`      | **Absolute** host path for the destination directory.                                              | Required |
| `destinationDirectoryContainerPath` | **Absolute** container path for the destination folder (any symlinked files will be to this path). | Required |
| `snapshotPath`                      | **Absolute** host snapshot file path.                                                              | Required |
| `safeDelete`                        | Number of files to be safely deleted. Any value greater than this will be skipped.                 | `10`     |

### Example

```bash
make run \
  soureDirectoryHostPath=/home/libraries \
  sourceDirectoryContainerPath=/libraries \
  destinationDirectoryHostPath=/home/remote \
  destinationDirectoryContainerPath=/remote \
  snapshotPath=/home/snapshot.json \
  safeDelete=10
```
