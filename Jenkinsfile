@Library('jenkins-library') _

def pipeline = new org.js.LibPipeline(
    steps: this,
    packageManager: 'pnpm',
    testCmds: ['pnpm check-code-integrity'],
    pushCmds: ['pnpm publish:all'],
    buildDockerImage: 'build-tools/node:16-ubuntu-cypress',
    npmRegistries: [:],
    npmLoginEmail:'admin@soramitsu.co.jp',
    sonarProjectName: 'scale-codec-js-library',
    sonarProjectKey: 'jp.co.soramitsu:scale-codec-js-library',    
    libPushBranches: ['master', 'feature/enable-publish-git-checks'],
    dockerImageTags: ['master': 'latest', 'feature/enable-publish-git-checks': 'duty'],
    )
pipeline.runPipeline()
