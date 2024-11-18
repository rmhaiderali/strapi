module.exports = (plugin) => {
  const restrictedKeys = [
    "id",
    // "email",
    "provider",
    "password",
    "resetPasswordToken",
    "confirmationToken",
    "confirmed",
    "blocked",
    "createdAt",
    "updatedAt",
  ]

  function isObject(v) {
    return typeof v === "object" && !Array.isArray(v) && v !== null
  }

  plugin.controllers.user.updateMe = async (ctx) => {
    if (!ctx.state.user?.id) {
      ctx.response.status = 401
      ctx.response.body = { error: "Unable to find your account." }
      return
    }

    if (!isObject(ctx.request.body)) {
      ctx.response.status = 401
      ctx.response.body = { error: "Missing request body." }
      return
    }

    for (const key of Object.keys(ctx.request.body)) {
      if (restrictedKeys.includes(key)) {
        ctx.response.status = 401
        ctx.response.body = {
          error: "Cannot update restricted key => " + key + ".",
        }
        return
      }
    }

    await strapi
      .query("plugin::users-permissions.user")
      .update({
        where: { id: ctx.state.user.id },
        data: ctx.request.body,
      })
      .then((res) => {
        ctx.response.status = 200
        // ctx.response.body = res
      })
  }

  plugin.routes["content-api"].routes.push({
    method: "PUT",
    path: "/user/me",
    handler: "user.updateMe",
    config: {
      prefix: "",
      policies: [],
    },
  })

  return plugin
}
