const { DateTime } = require("luxon");

const processWebhook = async (req, res) => {
  try {
    const { access_token, from, to } = req.body;

    const userIDs = await getUser(access_token);

    const mp4Downloads = await getRecords(userIDs, access_token, from, to);

    res.json({
      success: true,
      message: "Downloads fetched successfully",
      downloads: mp4Downloads,
      length: mp4Downloads.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUser = async (access_token) => {
  const response = await fetch("https://api.zoom.us/v2/users", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const userData = await response.json();
  const userIDs = userData.users.map((user) => user.id);

  return userIDs;
};

const getRecords = async (userIDs, access_token, from, to) => {
  let mp4Downloads = [];

  for (let i = 0; i < userIDs.length; i++) {
    // console.log("================", userIDs[i]);
    const response = await fetch(
      `https://api.zoom.us/v2/users/${userIDs[i]}/recordings?from=${from}&to=${to}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = await response.json();
    if (data?.meetings?.[0]?.recording_files?.length) {
      mp4Downloads.push(...extractMp4Downloads(data.meetings));
    }
  }

  return mp4Downloads;
};

const extractMp4Downloads = (records) => {
  const result = [];

  records.forEach((record) => {
    const pacificDate = DateTime.fromISO(record.start_time, {
      zone: "utc",
    }).setZone("America/Los_Angeles");

    const dateStr = pacificDate.toFormat("MM-dd-yyyy");

    record.recording_files.forEach((file) => {
      if (file.file_type === "MP4" && file.download_url) {
        result.push({
          filename: `${dateStr}-${record.topic}`,
          download_url: file.download_url,
        });
      }
    });
  });

  return result;
};

module.exports = {
  processWebhook,
};
